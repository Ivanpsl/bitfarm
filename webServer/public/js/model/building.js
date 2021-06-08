
building = {
    name: "",
    type: "building",
    owner : 0,
    turns_to_build: 2,
    modifier : {
        effect_type : "STORAGE",
        effect_size : 20
    },
    status : "WORKING",
    actions : [
        {
            name : "Demoler",
            execute : function(){
                game.sendAction()
            },
        },
    ],
}