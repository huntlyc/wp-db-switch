Atom WordPress Database Switch
==============================

## STILL IN DEV/PERSONAL USE - DON'T USE!!!

_(In reality, I should really be dockering it all...)_

For the curious though...

Setup the path to your wp-config.php file in the settings and when pressing
`Ctrl+Alt+w` it will read said config file compiling a list of database names.

Choose which one you want and it'll re-write the config file with that active.

For example, say, in your config file you have the following:

```

// ...other WP stuff

define('DB_NAME', 'db1'); //My first Database!!
// define('DB_NAME', 'db2'); //My first Database!!
// define('DB_NAME', 'db3'); //My first Database!!

// ...more other WP stuff

```

Press `Ctrl+Alt+w` select db3 and the config file will change to:

```
// ...other WP stuff


// define('DB_NAME', 'db1'); //My first Database!!
// define('DB_NAME', 'db2'); //My first Database!!
define('DB_NAME', 'db3'); //My first Database!!

// ...more other WP stuff
```
