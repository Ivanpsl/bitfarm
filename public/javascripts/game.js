var config = {
    type: Phaser.AUTO,
    parent: "game",
    width: 1280,
    height: 720,
    backgroundColor: "#E07C19",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    dom: {
        createContainer: true
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    callbacks: {
        postBoot: function(game){
            game.canvas.style.width = '98%';
            game.canvas.style.height = '90%';
        }
    }
};

var game = new Phaser.Game(config);
var numPlayers = 0;
var playerSizeW = 56;
var playerSizeH = 56;

function preload(){
    this.load.html("form","./assets/form.html");
    this.load.image('npc', './assets/mapTile_136.png');
}

function create(){
    
    var self = this;
    // this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#ffffff");
    this.socket = io();
    this.cursors = this.input.keyboard.createCursorKeys();
    // this.player = this.physics.add.image(playerSizeW, playerSizeH, 'npc'); 
    this.otherPlayers = this.add.group();

    this.socket.on('currentPlayers', function(players){
        Object.keys(players).forEach(function(id){
            if(players[id].playerId === self.socket.id ){
                addPlayer(self,players[id]);
            }else{
                addOtherPlayer(self,players[id])
            }
        })
    });
    this.socket.on('newPlayer', function(playerInfo){
        addOtherPlayer(self,playerInfo);
    });
    this.socket.on('disconnect', function(playerId){
        self.otherPlayers.getChildern().forEach(function (otherPlayer){
            if(playerId === otherPlayer.playerId){
                otherPlayer.destroy();
            };
        });
    });


    let { width, height } = this.sys.game.canvas;
    this.textInput = this.add.dom(width-270,height).createFromCache("form").setOrigin(0.5);
    this.chat = this.add.text(width-270,10,"",{lineSpacing:15, backgroundColor:"#944A00", color:"#087394", padding:10, fontStyle:"bold"}).setOrigin(0);
    this.chat.setFixedSize(270,height-250);

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on("down", event => {
        let chatbox = this.textInput.getChildByName("chat");
        if(chatbox.value != ""){
            this.socket.emit("message",chatbox.value);
            chatbox.value="";
        }
    });
}

function update(){}


function addPlayer(self,playerInfo){
    var positionY = playerSizeH*numPlayers + (playerSizeH/2);
    var color = getRandomColor();
    self.myNpc= self.physics.add.image((playerSizeW/2) +10,positionY,'npc').setOrigin(0.5,0.5).setDisplaySize(playerSizeW,playerSizeH);

    self.add.text((playerSizeW/2)*2,positionY,playerInfo.name,{fontSize: '12px', fill: '#'+color});
    
    numPlayers +=1;
    self.myNpc.setTint('0x'+color);

    // self.npc.setDrag(100);
    // self.npc.setAngularDrag(100);
    // self.npc.setMaxVelocity(200);
}

function addOtherPlayer(self,playerInfo){
    var color = getRandomColor();

    var positionY = playerSizeH*numPlayers + (playerSizeH/2);
    const otherPlayer = self.add.sprite((playerSizeW/2) +10,positionY,'npc');
    self.add.text((playerSizeW/2)*2,positionY,playerInfo.name,{fontSize: '12px', fill: '#'+color});
    numPlayers += 1;

    otherPlayer.setTint('0x'+color);

    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  