

var LyricsContainer = null;

const canvas = document.getElementById( 'Canvas' );

var CreateLyricsContainer;
(function(){
//今（何時の？）はクロームしか対応してないらしいけどこれで書記素で分割出来るらしい
const segmenter = new Intl.Segmenter("ja", {granularity: "grapheme"});
function grapheme_split(text)
{
    const segments = segmenter.segment(text);
    const array = [];
    for(const seg of segments) {
        array.push(seg.segment);
    }
    return array;
}
CreateLyricsContainer = (text)=>{
    return new RubyKaraokeLyricsContainer(text,grapheme_split);
}

}());

const Offset = document.getElementById( 'Offset' );
const updatebutton = document.getElementById( 'Update' );
const Time = document.getElementById( 'Time' );
const FPS = document.getElementById( 'FPS' );

const FontFamily = document.getElementById( 'FontFamily' );
const GenericName = document.getElementById( 'GenericName' );
const FontSize = document.getElementById( 'FontSize' );
const Outline = document.getElementById( 'Outline' );
const RubyFontFamily = document.getElementById( 'RubyFontFamily' );
const RubyFontSize = document.getElementById( 'RubyFontSize' );
const RubyOutline = document.getElementById( 'RubyOutline' );
const RubyHeight = document.getElementById( 'RubyHeight' );
const StandbyFillColor = document.getElementById( 'StandbyFillColor' );
const StandbyStrokeColor = document.getElementById( 'StandbyStrokeColor' );
const ActiveFillColor = document.getElementById( 'ActiveFillColor' );
const ActiveStrokeColor = document.getElementById( 'ActiveStrokeColor' );
const LineJoin = document.getElementById( 'LineJoin' );

const BGColor = document.getElementById( 'BGColor' );

const atTag = new AtTagContainer();


function Update(karaokeline)
{
    if (!karaokeline)
        return;
    canvas.style.backgroundColor = BGColor.value;

    const familyname = FontFamily.value ?  `"${FontFamily.value}",` : "";
    const rubyfamilyname = RubyFontFamily.value ?  `"${RubyFontFamily.value}",` : "";

    const lineJoin = LineJoin.value.indexOf("miter") == 0 ? "miter" : LineJoin.value;
    const miter = LineJoin.value.indexOf("miter") == 0 ? Number(LineJoin.value.substring(5)) : 10;

    const fonttext = `${familyname} ${GenericName.value}`;
    const rubyfonttext =  `${rubyfamilyname} ${GenericName.value}`;
    const karaoke = new KaraokeLineCanvas(karaokeline,
        Number(FontSize.value),fonttext,Number(Outline.value),
        Number(RubyFontSize.value),rubyfonttext,Number(RubyOutline.value),Number(RubyHeight.value),
        ActiveStrokeColor.value,ActiveFillColor.value,
        StandbyStrokeColor.value,StandbyFillColor.value,lineJoin,miter);

    karaoke.Draw(karaokeline.start_time + Number(Time.value) + Number(Offset.value));


    canvas.width = karaoke.canvas.width;
    canvas.height = karaoke.canvas.height;
    const size = document.getElementById( 'CanvasSize' );
    size.textContent = `width=${canvas.width} height=${canvas.height}`;


    const ctx = canvas.getContext("2d");
    ctx.drawImage(karaoke.canvas,0,0);

}


updatebutton.onclick = ()=>Update(CurrentLine);
Time.onchange = ()=>Update(CurrentLine);

const LyricsList = document.getElementById('LyricsList');
var CurrentLine = null;

function LoadFile(text)
{
    while (LyricsList.firstChild)
        LyricsList.firstChild.remove();

    LyricsContainer = CreateLyricsContainer(text);

    Offset.value = Math.floor(LyricsContainer.atTag.offset * 1000);
    LyricsContainer.lines.forEach(line=>
    {
        const li = document.createElement("li");
        const label = document.createElement("label");
        label.classList.add("list_label");
        label.textContent = "　";
        label.dataset.start_time = line.start_time;
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "karaokelines";
        radio.onclick = (e) =>{
            CurrentLine = line;
            Update(line);
        };

        const start_time = document.createElement("span");
        start_time.textContent = TimeTagElement.TimeString(line.start_time);
        start_time.classList.add("list_time");

        const text = document.createElement("span");
        let content = "";
        line.units.forEach(u=>
        {
            if (u.hasRuby)
            {
                content +="<ruby>" + u.base_text + "<rt>" + u.phonetic.text + "</ruby>";
            }
            else
            content += u.phonetic.text;
        });
        text.innerHTML = content;
        text.classList.add("list_text");

        label.appendChild(radio);
        label.appendChild(start_time);
        label.appendChild(text);
        li.appendChild(label);
        LyricsList.appendChild(li);        
    });

}


document.getElementById('MakeImageSequence').onclick = async ()=>
{
    const karaokeline = CurrentLine;
    if (!karaokeline || karaokeline.start_time < 0)
        return;

    const familyname = FontFamily.value ?  `"${FontFamily.value}",` : "";
    const rubyfamilyname = RubyFontFamily.value ?  `"${RubyFontFamily.value}",` : "";

    const lineJoin = LineJoin.value.indexOf("miter") == 0 ? "miter" : LineJoin.value;
    const miter = LineJoin.value.indexOf("miter") == 0 ? Number(LineJoin.value.substring(5)) : 10;

    const fonttext = `${familyname} ${GenericName.value}`;
    const rubyfonttext =  `${rubyfamilyname} ${GenericName.value}`;
    const karaoke = new KaraokeLineCanvas(karaokeline,
        Number(FontSize.value),fonttext,Number(Outline.value),
        Number(RubyFontSize.value),rubyfonttext,Number(RubyOutline.value),Number(RubyHeight.value),
        ActiveStrokeColor.value,ActiveFillColor.value,
        StandbyStrokeColor.value,StandbyFillColor.value,lineJoin,miter);

    const fps = Number(FPS.value);
   

    const start_frame = Math.floor(karaokeline.start_time / 1000 * fps);
    const end_frame = Math.ceil(karaokeline.end_time / 1000 * fps);

    const start_sec = start_frame / fps;
    const min = ("0" + Math.floor(start_sec / 60)).slice(-2);
    const sec = ("0" + Math.floor(start_sec % 60)).slice(-2);
    const ms = ("00" + Math.floor(start_sec * 1000 % 1000)).slice(-3);
    const base_name = `${min}m${sec}s${ms}`;

    const zip = JSZip();

    let counter = 0;
    const total_frame = end_frame - start_frame + 1;
    for (let i = 0;i < total_frame;i++)
    {
        const name = `${base_name}_${("000" + i.toString()).slice(-4)}.png`;
        karaoke.Draw((start_frame + i) * 1000 / fps + Number(Offset.value));

        karaoke.canvas.toDataURL();
        //toBlobが非同期処理なのにPromiseを使ってない不具合
        //なにこの変な待ち方？
        karaoke.canvas.toBlob(blob=>
            {
                console.log("toBlob:" + name);
                zip.file(name,blob);
                counter++;
            });
    }
    while (total_frame !== counter)
    {
        await function sleep(ms){return new Promise((resolve) => setTimeout(resolve, ms));}(1);
    }
    
    const zipblob = await zip.generateAsync({ type: 'blob' });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(zipblob);
    a.download = "KaraokeImageSequence.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
};

document.getElementById('MakeAllImageSequence').onclick = async ()=>
{
    if (!LyricsContainer)
        return;

    const familyname = FontFamily.value ?  `"${FontFamily.value}",` : "";
    const rubyfamilyname = RubyFontFamily.value ?  `"${RubyFontFamily.value}",` : "";

    const lineJoin = LineJoin.value.indexOf("miter") == 0 ? "miter" : LineJoin.value;
    const miter = LineJoin.value.indexOf("miter") == 0 ? Number(LineJoin.value.substring(5)) : 10;

    const fonttext = `${familyname} ${GenericName.value}`;
    const rubyfonttext =  `${rubyfamilyname} ${GenericName.value}`;

    const fps = Number(FPS.value);

    const zip = JSZip();

    for (let j = 0;j < LyricsContainer.lines.length;j++)
    {
        const line = LyricsContainer.lines[j];
        if (line.start_time < 0)
            continue;
        const karaoke = new KaraokeLineCanvas(line,
            Number(FontSize.value),fonttext,Number(Outline.value),
            Number(RubyFontSize.value),rubyfonttext,Number(RubyOutline.value),Number(RubyHeight.value),
            ActiveStrokeColor.value,ActiveFillColor.value,
            StandbyStrokeColor.value,StandbyFillColor.value,lineJoin,miter);
        if (karaoke.canvas.width <= Number(Outline.value) / 2)
            continue;

        const start_frame = Math.floor(line.start_time / 1000 * fps);
        const end_frame = Math.ceil(line.end_time / 1000 * fps);

        const start_sec = start_frame / fps;
        const min = ("0" + Math.floor(start_sec / 60)).slice(-2);
        const sec = ("0" + Math.floor(start_sec % 60)).slice(-2);
        const ms = ("00" + Math.floor(start_sec * 1000 % 1000)).slice(-3);
        const base_name = `${min}m${sec}s${ms}`;
        
        const folder = zip.folder(base_name);

        let counter = 0;
        const total_frame = end_frame - start_frame + 1;
        for (let i = 0;i < total_frame;i++)
        {
            const name = `${base_name}_${("000" + i.toString()).slice(-4)}.png`;
            karaoke.Draw((start_frame + i) * 1000 / fps + Number(Offset.value));

            karaoke.canvas.toDataURL();
            //toBlobが非同期処理なのにPromiseを使ってない不具合
            //なにこの変な待ち方？
            karaoke.canvas.toBlob(blob=>
                {
                    console.log("toBlob:" + name);
                    folder.file(name,blob);
                    counter++;
                });
        }
        while (total_frame !== counter)
        {
            await function sleep(ms){return new Promise((resolve) => setTimeout(resolve, ms));}(1);
        }
    }
    
    const zipblob = await zip.generateAsync({ type: 'blob' });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(zipblob);
    a.download = "KaraokeImageSequence.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
};

