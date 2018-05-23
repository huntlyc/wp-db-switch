'use babel';

import { SelectListView } from 'atom-space-pen-views';

export default class DatabasesAvailableView extends SelectListView {

    constructor(WpDbSwitch) {
        super(...arguments);
        this.WpDbSwitch = WpDbSwitch;
    }

    initialize() {
        super.initialize(...arguments);
        this.addClass('wp-db-select-view');
        this.list.addClass('wp-db-select-list');
        this.list.addClass('mark-active');
    }

    show() {
        this.panel = atom.workspace.addModalPanel({ item: this });
        this.panel.show();
        this.focusFilterEditor();
    }

    hide() {
        this.panel.hide();
    }

    getFilterKey(){
        return "searchKey";
    }

    setItems(items) {
        super.setItems(items);

        const activeItemView = this.find('.active');
        if (0 < activeItemView.length) {
            this.selectItemView(activeItemView);
            this.scrollToItemView(activeItemView);
        }
    }

    setActiveDB(target) {
        if(this.WpDbSwitch){
            this.WpDbSwitch.saveActiveDB(target);
        }
    }

    viewForItem(item) {
        const activeTarget = (this.WpDbSwitch && this.WpDbSwitch.activeDB) ? this.WpDbSwitch.activeDB : '';

        console.log('at', this.WpDbSwitch);
        return DatabasesAvailableView.render(function () {
            const activeClass = (item.searchKey === activeTarget ? 'active' : '');
            this.li({ class: activeClass }, item.searchKey);
        });
    }

    getEmptyMessage(itemCount) {
        return (0 === itemCount) ? 'No targets found.' : 'No matches';
    }

    awaitSelection() {
        return new Promise((resolve, reject) => {
            this.resolveFunction = resolve;
        });
    }

    confirmed(target) {
        this.setActiveDB(target);
        // if (this.resolveFunction) {
        //   this.resolveFunction(target);
        //   this.resolveFunction = null;
        // }
        this.hide();
    }

    cancelled() {
        this.hide();
    }
}
