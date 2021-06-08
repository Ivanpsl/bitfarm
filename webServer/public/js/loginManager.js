$(document).ready(function () {

    $('#login-link').click(function(){
        $('#reg').addClass('nodisplay');
        $('#log').removeClass('nodisplay');
    })
    function ShowSingUp(){
        $('#log').addClass('nodisplay');
        $('#reg').removeClass('nodisplay');
        
    }
    function ShowLoging(){
        $('#reg').addClass('nodisplay');
        $('#log').removeClass('nodisplay');
    }
})

