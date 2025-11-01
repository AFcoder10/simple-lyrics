import { setupGlobalEventHandlers } from './event-handlers/globalEventHandlers';

// Spicetify Injection
declare global {
  interface Window {
    Spicetify: any;
  }
}

async function main() {
  setupGlobalEventHandlers();
}

export default main;
