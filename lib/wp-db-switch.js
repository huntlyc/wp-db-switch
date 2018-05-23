'use babel';

import WpDbSwitchView from './databases-available';
import { CompositeDisposable } from 'atom';


export default {
    fs: require('fs-plus'),
    wpDbSwitchView: null,
    modalPanel: null,
    subscriptions: null,
    activeDB: null,
    config: {
        WordpressConfigFileLocation: {
            title: 'Your wp-config.php file location',
            description: 'Usually resides in the root of the WordPress direcctory',
            type: 'string',
            default: '/var/www/wordpress/wp-config.php'
        }
    },

    activate(state) {
        this.wpDbSwitchView = new WpDbSwitchView(this);


        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'wp-db-switch:toggle': () => this.showDBSwitchList()
        }));
    },

    getDatabases(){
        return [{name: 'db1'},{name: 'db2'},{name: 'db3'}].map(db => db.name);
    },

    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.wpDbSwitchView.destroy();
    },

    serialize() {
        return {
            wpDbSwitchViewState: this.wpDbSwitchView.serialize()
        };
    },

    showDBSwitchList() {
        const editor = atom.workspace.getActiveTextEditor();
        this.wpDbSwitchView = this.wpDbSwitchView || new WpDbSwitchView(this)

        const filePath = atom.config.get('wp-db-switch.WordpressConfigFileLocation')

        this.fs.readFile(filePath, {encoding: 'utf-8', flag: 'r'}, (err, data) =>{
            const dbList = [];

            if (err){
                atom.notifications.addError("WP DB Switch: wp-config.php file doesn't exist&hellip; Check your settings",{})
            }else{

                const fileContents = data;
                const regex = /^(\/\/)?\s?define\s?\(\s?\'DB\_NAME\'\s?\,\s?\'(.+)\'\s?\);\s?(\/\/)?\s?(.*)$/gm;

                let m;

                while ((m = regex.exec(fileContents)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                    let db = {
                        name: m[2],
                        comment: m[4],
                        searchKey: `${m[2]} //${m[4]}`,
                        active: (typeof m[1] === 'undefined'),
                        sourceLine: m[0]
                    }

                    if(db.active){
                        this.activeDB = db.searchKey;
                        console.log(`${db.name} is active`)
                    }

                    dbList.push(db);

                }

                this.wpDbSwitchView.setItems(dbList);
                this.wpDbSwitchView.show(this)
            }
        });
    },

    saveActiveDB(dbname){
        this.activeDB = dbname;
        console.log(this.activeDB.name);


        const filePath = atom.config.get('wp-db-switch.WordpressConfigFileLocation')

        this.fs.readFile(filePath, {encoding: 'utf-8', flag: 'r'}, (err, data) =>{
            const dbList = [];

            if (err){
                atom.notifications.addError("WP DB Switch: wp-config.php file doesn't exist&hellip; Check your settings",{})
            }else{

                let fileContents = data;


                // make inactive, any active databases
                let regex = /^define\(\s?'DB_NAME/gm;
                let subst = `// define('DB_NAME`;

                fileContents = fileContents.replace(regex, subst);

                // make active our newly selected one
                regex = new RegExp("^(\/\/)?\\s?define\\s?\\(\\s?'DB_NAME'\\s?,\\s?'" + this.activeDB.name + "'\\s?\\);\\s?(\/\/)?\\s?(.*)$", 'gm');
                subst = `define('DB_NAME', '${this.activeDB.name}'); //${this.activeDB.comment}`;

                fileContents = fileContents.replace(regex, subst);

                this.fs.writeFile(filePath, fileContents, {encoding: 'utf-8'}, (err) =>{
                    if (err){
                        atom.notifications.addError("WP DB Switch: wp-config.php file doesn't exist&hellip; Check your settings",{})

                    }
                });


            }
        });
    }
};
