
const URL_BASE = "https://localhost:3000";
const HOME_URL = "https://localhost:3000";

const ROOM_CONSTANTS = {
    //ESTADO
    STATUS_EMPTY : "EMPTY",
    STATUS_WAITING: "WAITING",
    STATUS_RUNNING: "RUNNING",
    //TIPO
    TYPE_PUBLIC : "PUBLIC",
    TYPE_PRIVATE : "PRIVATE",
    //EVENTOS
    EVENT_PLAYERMESSAGE : "PLAYER_MESSAGE",
    EVENT_PLAYER_JOIN : "PLAYER_JOIN",
    EVENT_PLAYER_EXIT : "PLAYER_EXIT",
    EVENT_PLAYER_CHANGE_STATUS : "PLAYER_CHANGE_STATUS",

    EVENT_SYNC_TIMES : "SYNC_TIMES",
    //ACCIONES
    ACTION_TERRAIN_BUILD : "TERRAIN_BUILD",
    ACTION_TERRAIN_PLANT : "TERRAIN_PLANT",

    ACTION_PLANT_RECOLLECT : "PLANT_RECOLLECT",
    ACTION_PLANT_WATTER : "PLANT_WATTER",

    ACTION_PLAYER_END_TURN: "PLAYER_END_TURN",

    
};


function removeAllChildNodes(parent) {
    while (parent && parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
};

function restartSesion() {
    Cookies.remove('actualRoomId');
    Cookies.remove('actualRoomType');
    window.location.href = HOME_URL;
}