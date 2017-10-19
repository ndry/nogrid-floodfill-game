export class MainMenu extends Phaser.State {    
    
    preload(): void {
        super.preload();

        this.load.image('singlePlayerBtn', './assets/ui/singlePlayerBtn.png');
        this.load.image('hostGameBtn', './assets/ui/hostGameBtn.png');
        this.load.image('joinGameBtn', './assets/ui/joinGameBtn.png');
    }

    background: Phaser.Sprite;
    singlePlayerBtn: Phaser.Button;
    hostGameBtn: Phaser.Button;
    joinGameBtn: Phaser.Button;

    create() {
        this.singlePlayerBtn = this.add.button(this.world.centerX,
            this.world.centerY - 70,
            "singlePlayerBtn",
            () => this.game.state.start('Level01', true, false));
        this.singlePlayerBtn.anchor.set(0.5);

        this.hostGameBtn = this.add.button(this.world.centerX,
            this.world.centerY - 0,
            "hostGameBtn",
            () => this.game.state.start('HostGame', true, false));
        this.hostGameBtn.anchor.set(0.5);

        this.joinGameBtn = this.add.button(this.world.centerX,
            this.world.centerY + 70,
            "joinGameBtn",
            () => this.game.state.start('JoinGame', true, false));
        this.joinGameBtn.anchor.set(0.5);
    }
}
