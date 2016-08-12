function sync(file) {
    uploadBar.classList.add('waiting');
    chrome.syncFileSystem.requestFileSystem(function(fileSystem) {
        fileSystem.root.getFile(file.name, { create: true }, function(fileEntry) {
            fileEntry.createWriter(function(writer) {
                writer.write(file);
            });
        });
    });
}

onload = function() {
    chrome.syncFileSystem.requestFileSystem(function(fileSystem) {
        var reader = fileSystem.root.createReader();
        reader.readEntries(function(entries) {
            for (var i=0; i<entries.length; i++)
                show(entries[i]);
        });
    });
    chrome.syncFileSystem.onFileStatusChanged.addListener(function(info) {
        if (info.action === 'updated')
            show(info.fileEntry);
    });
}

function show(fileEntry) {
    fileEntry.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function(event) {
            addFile(file.type, event.target.result, fileEntry.fullPath);
            uploadBar.classList.remove('waiting');
        }
        reader.readAsDataURL(file);
    });
}

function addFile(fileType, dataUrl, filePath) {
    var div = document.createElement('div');
    div.dataset['path'] = filePath;
    div.classList.add('box');
    div.addEventListener('click', save);

    switch (fileType.substr(0, fileType.indexOf('/'))) {
        case 'image':
            var element = document.createElement('img');
            element.src = dataUrl;
            div.classList.add('image');
            break;
        case 'audio':
            var element = document.createElement('audio');
            element.controls = true;
            element.src = dataUrl;
            div.classList.add('audio');
            break;
        case 'video':
            var element = document.createElement('video');
            element.controls = true;
            element.src = dataUrl;
            div.classList.add('video');
            break;
        default:
            var element = document.createElement('p');
            element.innerText = filePath;
            div.classList.add('raw');
            break;
    }
    div.appendChild(element);
    document.body.insertBefore(div, document.body.firstChild);
}

function save(event) {
    if (event.target.nodeName === 'VIDEO' || event.target.nodeName === 'AUDIO') 
      return;
    var path = this.dataset.path;
    chrome.syncFileSystem.requestFileSystem(function(fileSystem) {
        fileSystem.root.getFile(path, { create: false }, function(fileEntry) {
            chrome.fileSystem.chooseEntry({ type: 'saveFile', 'suggestedName': path },
                    function(writableFileEntry) {
                writableFileEntry.createWriter(function(writer) {
                    fileEntry.file(function(file) {
                        writer.write(file);
                    });
                });
            });
        });
    });
}

function dragover(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadBar.classList.add('dragover');
}

function dragleave(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadBar.classList.remove('dragover');
}

function drop(event) {
    dragleave(event);
    sync(event.dataTransfer.files[0]);
}

function open() {
    chrome.fileSystem.chooseEntry(function(entry) {
        entry.file(function(file) {
          sync(file);
        });
    });
}

var uploadBar = document.querySelector('.uploadBar');
uploadBar.addEventListener('dragover', dragover);
uploadBar.addEventListener('dragleave', dragleave);
uploadBar.addEventListener('drop', drop);
uploadBar.addEventListener('click', open);
