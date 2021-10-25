(function FilesDrop(){
    var droparea = document.createElement("div")
        
    function showDroparea(){
        droparea.style.cssText = "all: initial;\
                                    position: fixed;\
                                    top:0;left:0;\
                                    z-index: 1000;\
                                    width: 100%;\
                                    height: 100%;\
                                    box-sizing: border-box;\
                                    display: block;\
                                    border: 8px dashed #333333;\
                                    background-color:rgba(0,0,0,0.5);"
    }
    
    function hideDroparea(){
        droparea.style.cssText = "all: initial;\
                                    position: fixed;\
                                    top:0;left:0;\
                                    z-index: 1000;\
                                    width: 100%;\
                                    height: 100%;\
                                    box-sizing: border-box;\
                                    display: none;";
    }
    
    droparea.ondragleave = e => {
        e.preventDefault();
        hideDroparea();
    };
    
    window.addEventListener("dragover", e => e.preventDefault(), false)
    window.addEventListener("dragenter", e => {
        e.preventDefault();
        showDroparea();
    }, false);
    window.addEventListener("drop", e => {
        e.preventDefault();
        hideDroparea();

        DropFiles(e.dataTransfer.files);
    }, false);
    
    document.body.appendChild(droparea);
    

    function DropFiles(files)
    {
        for (let i = 0;i < files.length;i++)
        {
            const file = files[i]
            if (file.type.indexOf("text/") == 0 || file.name.match(/\.(lrc|kra)$/i))
            {
                console.log("drop text file:" + file.name);

                file.text().then(text=>
                {
                    LoadFile(text);
                });
            }
            else
            {
                console.log("ignore drop file:" + file.name);
            }
        }
    }
})();
    