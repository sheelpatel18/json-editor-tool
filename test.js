var robot = require("kbm-robot");

robot.startJar();

robot.press("alt")
    .press("tab")
    .sleep(100)
    .release("tab")
    .release("alt")
    .sleep(100)
    .type("Hello World!")
    .go()
    .then(robot.stopJar);