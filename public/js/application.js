import { Application } from "@hotwired/stimulus";

import ConfigController from "./controllers/config_controller.js";
import TimerController from "./controllers/timer_controller.js";

const app = Application.start();
app.register("config", ConfigController);
app.register("timer", TimerController);
