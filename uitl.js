function postURL(url,body){
    return $.ajax({
        type: "POST",
        url: url,
        data: body,
        async: false
    }).responseText;
};

function getURL(url){
    return $.ajax({
        type: "GET",
        url: url,
        async: false
    }).responseText;
};