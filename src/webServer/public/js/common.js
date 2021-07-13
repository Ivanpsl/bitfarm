/* eslint-disable no-unused-vars */


const URL_BASE =  window.location.protocol + "//" + window.location.host;//"https://localhost:3000";
const HOME_URL =  window.location.protocol + "//" + window.location.host;//"https://localhost:3000";

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
    EVENT_GAME_START : "GAME_START"
};

const GAME_CONSTANTS = {
    
    // ESTADO PARTIDA
    GAME_STATUS_PLAYING : "GAME_PLAYING",
    GAME_STATUS_ENDED : "GAME_ENDED",

    //TIPOS
    TYPE_TERRAIN : "TERRAIN",
    TYPE_TOOL : "TOOL",
    TYPE_BUILDING : "BUILDING",
    TYPE_PRODUCT : "PRODUCT",

    // TERRENOS
    TERRAIN_STATUS_EMPTY : "TERRAIN_EMPTY",
    TERRAIN_STATUS_PLANTED : "TERRAIN_PLANTED",
    TERRAIN_STATUS_BUILDED : "TERRAIN_BUILDED",
    //PRODUCTOS
    PRODUCT_STATUS_SEED : "PRODUCT_SEED",
    PRODUCT_STATUS_PLANTED : "PRODUCT_PLANTED",
    PRODUCT_STATUS_GROW : "PRODUCT_GROW",
    PRODUCT_STATUS_ROTTEN : "PRODUCT_ROTTEN",
    PRODUCT_STATUS_DRY : "PRODUCT_DRY",
    //CONSTRUCCIONES
    BUILDING_STATUS_BUILD : "BUILDING_PROCESSING",
    BUILDING_STATIS_COMPLETED : "BUILDING_COMPLETED",

    //EVENTOS
    EVENT_SYNC_TIMES : "SYNC_TIMES",
    EVENT_PLAYER_END_TURN : "END_TURN",
    EVENT_START_TURN : "START_TURN",
    EVENT_PLAYER_EXIT : "PLAYER_EXIT",
    EVENT_PLAYER_ACTION : "PLAYER_ACTION",
    EVENT_UPDATE_GAME_DATA : "UPDATE",
    EVENT_NEW_TRANSACTION_LOG : "NEW_TRANSACTION",
    EVENT_NEW_BLOCK_LOG : "NEW_BLOCK",
    EVENT_OFFERT_BUY : "OFFERT_BUY",
    EVENT_OFFERT_CREATE : "NEW_OFFERT",
    EVENT_OFFERT_REMOVE : "OFFERT_REMOVE",

    //ACCIONES
    ACTION_START_GAME : "ACTION_START_GAME",
    ACTION_TERRAIN_BUILD : "ACTION_TERRAIN_BUILD",
    ACTION_TERRAIN_PLANT : "ACTION_TERRAIN_PLANT",

    ACTION_PLANT_RECOLLECT : "ACTION_PLANT_COLLECT",
    ACTION_PLANT_WATERING : "ACTION_PLANT_WATERING",

    ACTION_BUILD_DEMOLISH : "ACTION_BUILD_DEMOLISH",
    ACTION_BUILD_UPGRADE : "ACTION_BUILD_UPGRADE",
    ACTION_PLAYER_END_TURN: "PLAYER_END_TURN",

    ACTION_ELEMENT_BUY : "ACTION_ELEMENT_BUY",
};

function productStatusToString(status){
    if(GAME_CONSTANTS.PRODUCT_STATUS_SEED === status)
        return "Semilla";
    if(GAME_CONSTANTS.PRODUCT_STATUS_PLANTED === status)
        return "Plantado";
    if(GAME_CONSTANTS.PRODUCT_STATUS_GROW === status)
        return "Maduro";
    if(GAME_CONSTANTS.PRODUCT_STATUS_ROTTEN === status)
        return "Podrido";
    if(GAME_CONSTANTS.PRODUCT_STATUS_DRY === status)
        return "Seco";
}
function removeAllChildNodes(parent) {
    if(parent)
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
}

/*global  Cookies,window,gameManager*/
function restartSesion() {
    // @ts-ignore
    Cookies.remove('userId');
    // @ts-ignore
    Cookies.remove('actualRoomId');
    // @ts-ignore
    Cookies.remove('actualRoomType');

    var mensaje = "Se ha perdido la conexión con el servidor";
    window.location.href = HOME_URL+`/game/login.html?mensaje=${mensaje}&tipoMensaje=alert-danger` ; 
    if(gameManager.gameEventsHandler && gameManager.gameEventsHandler.listening){
        gameManager.gameEventsHandler.disconect();
    }
}

