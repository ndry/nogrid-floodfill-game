export class Preloader extends Phaser.State {
    loaderText: Phaser.Text;

    preload() {
        
        this.loaderText = this.game.add.text(this.world.centerX, 200, "Loading...",
            { font: "18px Arial", fill: "#FFFFFF", align: "center" });
        this.loaderText.anchor.setTo(0.5);
    }

    create() {
        var tween = this.add.tween(this.loaderText).to({ alpha: 0 }, 20,
            Phaser.Easing.Linear.None, true);
        tween.onComplete.add(this.startMainMenu, this);
    }

    startMainMenu() {
        this.game.state.start('MainMenu', true, false);
    }

}
