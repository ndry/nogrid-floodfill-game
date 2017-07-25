declare function uuidv4(): string;
declare const nano: any;

module $safeprojectname$.Client {
    export class GameEngine extends Phaser.Game {
        
        constructor() {
            super(888 * 2 + 100, 804, Phaser.AUTO, 'content', null);

            this.state.add('Boot', Boot, false);
            this.state.add('Preloader', Preloader, false);
            this.state.add('MainMenu', MainMenu, false);
            this.state.add('Level01', Level01, false);
            this.state.add('HostGame', HostGame, false);
            this.state.add('JoinGame', JoinGame, false);

            this.state.start('Level01');

        }
    }
}

window.onload = () => {
    new $safeprojectname$.Client.GameEngine();
};