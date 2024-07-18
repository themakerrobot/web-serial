window.onload = function() {
    const textEncoder = new TextEncoderStream();
    const textDecoder = new TextDecoderStream();
    const reader = textDecoder.readable.getReader();
    const writer = textEncoder.writable.getWriter();
    const command = document.getElementById('command');
    const result = document.getElementById('result');
    const send = document.getElementById('send');
    const view = document.getElementById('view');
    const stop = document.getElementById('stop');


let editor;


  editor = CodeMirror(document.getElementById("python-code"), {
    mode: "python",
    theme: "monokai",
    lineNumbers: true,
    readOnly: true
  });

view.addEventListener('click', async () => {
  const code = Blockly.Python.workspaceToCode(workspace);
  console.log(code);
  editor.setValue(code);
});

    
    // view.addEventListener('click', async () => {
    //   console.log(Blockly.Python.workspaceToCode(workspace));
    //   document.getElementById("python-code").innerText = Blockly.Python.workspaceToCode(workspace);
    // });

    send.addEventListener('click', async () => {
      codetext = Blockly.Python.workspaceToCode(workspace);
      console.log(codetext)
      await writer.write(codetext);
      send.disabled = true;
      document.getElementById("output").innerText = '';
            
      setTimeout(()=> {
        send.disabled = false;
      }, 3000);
    });
    
    stop.addEventListener('click', async () => {
      await writer.write('###END###');
      //writer.releaseLock();
    });
    
    document.getElementById('connect').addEventListener('click', async () => {
    /*
     const filters = [
      { usbVendorId: 0x2341, usbProductId: 0x0043 },
      { usbVendorId: 0x2341, usbProductId: 0x0001 }
    ];
    const port = await navigator.serial.requestPort({ filters });
    */
    const port = await navigator.serial.requestPort();
    const { productId, vendorId } = port.getInfo();
    console.log('Machine:', productId, vendorId);

    await port.open({ baudRate: 115200 });
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          // 스트림이 끝났을 때
          console.log("Serial port closed");
          break;
        }
        // 받은 데이터 처리
        if (value) {
          document.getElementById("output").innerText += value;
          console.log("Received:", value);
        }
      }
    } catch (error) {
      console.error("Error reading from serial port:", error);
    } finally {
      reader.releaseLock();
      writer.releaseLock();
      await port.close();
    }  
  });

if ("serial" in navigator) console.log("Your browser supports Web Serial API!");
else document.getElementById("output").innerText = alert("Your browser does not support Web Serial API, the latest version of Google Chrome is recommended!");

let CURRENT_DIR;
let CODE_PATH = '';
let BLOCK_PATH = '';
let saveCode = "";
let saveBlock = "{}";

function findBlocks(data) {
  if (data && typeof data === 'object') {
    if ('block' in data) {
      jdata = data['block'];
      if(jdata['type'].includes('_dynamic')) {
        updateSecondDropdown.call(workspace.getBlockById(jdata['id']), jdata['fields']['dir'], jdata['fields']['filename'])
      }
    }
    for (const key in data) {
      findBlocks(data[key]);
    }
  }
}

let update_block = () => {
  $("#codecheck").html(saveBlock==JSON.stringify(Blockly.serialization.workspaces.save(workspace)) ? "" : "<i class='fa-solid fa-circle fa-fade'></i>");
}

const workspace = Blockly.inject("blocklyDiv", {
  toolbox: lang=="en"?toolbox_en:toolbox_ko,
  collapse: true,
  comments: true,
  disable: true,
  maxBlocks: Infinity,
  trashcan: true,
  horizontalLayout: false,
  toolboxPosition: "start",
  css: true,
  // media: "./static/",
  rtl: false,
  scrollbars: true,
  sounds: false,
  oneBasedIndex: true,
  grid: {
    spacing: 20,
    length: 3,
    colour: '#ddd',
    snap: true
  },
  zoom: {
    controls: true,
    wheel: false,
    startScale: 0.7,
    maxScale: 3,
    minScale: 0.3,
    scaleSpeed: 1.05,
    pinch: true
  },
  move:{
    scrollbars: {
      horizontal: true,
      vertical: true
    },
    drag: true,
    wheel: true,
  },
  renderer:"zelos", // "zelos", "minimalist", "thrasos"
  theme: Blockly.Theme.defineTheme('modest', {
    'base': Blockly.Themes.Classic,
    startHats: true,
    fontStyle: {
      'family': null,
      'weight': null,
      'size': 16,
    },
    blockStyles: {
      logic_blocks: {
        colourPrimary: '#B098CB',
        colourSecondary: '#EDE7F6',
        colorTertiary: '#B39DDB',
      },
      loop_blocks: {
        colourPrimary: '#85B687',
        colourSecondary: '#E8F5E9',
        colorTertiary: '#66BB6A',
      },
      math_blocks: {
        colourPrimary: '#2196F3',
        colourSecondary: '#1E88E5',
        colorTertiary: '#0D47A1',
      },
      text_blocks: {
        colourPrimary: '#FFAA08',
        colourSecondary: '#555555',
        colorTertiary: '#FF8F00',
      },
      list_blocks: {
        colourPrimary: '#4DB6AC',
        colourSecondary: '#B2DFDB',
        colorTertiary: '#009688',
      },
      colour_blocks: {
        colourPrimary: '#DFADB2',
        colourSecondary: '#FFEBEE',
        colorTertiary: '#EF9A9A',
      },
      variable_blocks: {
        colourPrimary: '#EF9A9A',
        colourSecondary: '#EF9A9A',
        //colourSecondary: '#FFEBEE',
        colorTertiary: '#EF5350',
      },
      // variable_dynamic_blocks: {
      //   colourPrimary: '#EF9A9A',
      //   colourSecondary: '#FFEBEE',
      //   colorTertiary: '#EF5350',
      // },
      procedure_blocks: {
        colourPrimary: '#C7BCB8',
        colourSecondary: '#EFEBE9',
        colorTertiary: '#BCAAA4',
      },
    },
    categoryStyles: {
      // logic_category: {
      //   colour: '#D1C4E9'
      // },
      // loop_category: {
      //   colour: '#A5D6A7'
      // },
      // math_category: {
      //   colour: '#2196F3'
      // },
      // text_category: {
      //   colour: '#FFCA28'
      // },
      // list_category: {
      //   colour: '#4DB6AC'
      // },
      // colour_category: {
      //   colour: '#FFCDD2'
      // },
      // variable_category: {
      //   colour: '#EF9A9A'
      // },
      // // variable_dynamic_category: {
      // //   colour: '#EF9A9A'
      // // },
      // procedure_category: {
      //   colour: '#D7CCC8'
      // }
    },
    componentStyles: {
      'flyoutOpacity': 0.5,
      'insertionMarkerOpacity': 0.5,
      'scrollbarOpacity': 0.5,
      'selectedGlowColour': '#000000',
      'selectedGlowSize': 0.5,
      'replacementGlowColour': '#000000',
    }
  }),
});
workspace.addChangeListener ((event)=>{
  update_block();
  if (event.type == Blockly.Events.CREATE) {
    if($("#codepath").html() == '') setTimeout(()=>{alert(translations["confirm_block_file"][lang])},500);
  }

  if (event.type == Blockly.Events.BLOCK_CHANGE) {
    if (event.element == 'field' && event.name == 'dir') {
      folderValue = workspace.getBlockById(event.blockId).getFieldValue('dir');
      updateSecondDropdown.call(workspace.getBlockById(event.blockId), folderValue);
    }
  }
});

$(document).keydown((evt)=> {
  if((evt.which == '115' || evt.which == '83') && (evt.ctrlKey || evt.metaKey)) {
      evt.preventDefault();
      let filepath = $("#codepath").html();

      if (filepath == "") {
        alert(translations['nofile'][lang]);
        return;
      }
      let codetype = "";
      codeTypeBtns.forEach((el) => {
        if (el.classList.value.includes("checked")) codetype = el.name;
      });
      if (codetype == "block") {
        // if (filepath.substring(filepath.lastIndexOf(".") + 1, filepath.length) != "json") {
        //   alert("json 파일만 저장 가능합니다.");
        //   return;
        // }
        saveBlock = JSON.stringify(Blockly.serialization.workspaces.save(workspace))
        socket.emit("save", {
          codepath: "/home/pi/blockly.py",
          codetext: Blockly.Python.workspaceToCode(workspace) });
        socket.emit("save", {
          codepath: $("#codepath").html(),
          codetext: saveBlock
        });
        result.value = Blockly.Python.workspaceToCode(workspace);
        update_block();
      }
      else {
        codeTypeBtns.forEach((el) => {
          if (el.classList.value.includes("checked")) codetype = el.name;
        });
        saveCode = codeEditor.getValue();
        CodeMirror.signal(codeEditor, "change");
        socket.emit("save", { codepath: $("#codepath").html(), codetext: saveCode });
      }
      return false;
  }
  return true;
});

const setLanguage = (langCode) => {
  const elements = document.querySelectorAll('[data-key]');
  elements.forEach(element => {
      const key = element.getAttribute('data-key');
      if (translations[key] && translations[key][langCode]) {
          element.textContent = translations[key][langCode];
      }
  });

 setLanguage('ko');
}
}
