

function MeasureKaraokeLineWidth(canvas,karaokeline,font,rubyfont)
{
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";

    let x = 0;
    let ruby_x = 0;
    for (let i = 0 ; i < karaokeline.units.length;i++)
    {
        if (karaokeline.units[i].hasRuby)
        {
            ctx.font = rubyfont;
            const pm = ctx.measureText(karaokeline.units[i].phonetic.text_array.join(""));
            ctx.font = font;
            const bm = ctx.measureText(karaokeline.units[i].base_text);

            const offset = (bm.width - pm.width) / 2;
            x += bm.width + ((ruby_x + offset < 0) ? -(ruby_x + offset) : 0);
            ruby_x = offset;
        }
        else
        {
            ctx.font = font;
            const pm = ctx.measureText(karaokeline.units[i].phonetic.text_array.join(""));
            x += pm.width;
            ruby_x += pm.width;
        }
    }
    return x + ((ruby_x < 0) ? -ruby_x : 0);
}

function DrawKaraokeLine(canvas,karaokeline,
                        font,rubyfont,rubyheight,outline,
                        strokeColor,fillColor,
                        lineJoin,miterLimit)
{
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.textBaseline = "top";
    ctx.lineWidth = outline;
    ctx.lineJoin = lineJoin;
    ctx.miterLimit = miterLimit;

    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;


    let x = outline / 2;
    let ruby_x = 0;
    for (let i = 0 ; i < karaokeline.units.length;i++)
    {
        const phonetic = karaokeline.units[i].phonetic.text_array.join("");
        if (karaokeline.units[i].hasRuby)
        {
            const base = karaokeline.units[i].base_text;
            ctx.font = rubyfont;
            const pm = ctx.measureText(phonetic);
            ctx.font = font;
            const bm = ctx.measureText(base);

            const offset = (bm.width - pm.width) / 2;
            if (ruby_x + offset < 0)
                x += -(ruby_x + offset);

            ctx.font = font;
            ctx.lineWidth = outline;
            ctx.strokeText(base,x,rubyheight + outline);
            ctx.fillText(base,x,rubyheight + outline);

            ctx.font = rubyfont;
            ctx.lineWidth = outline / 2;
            ctx.strokeText(phonetic,x + offset,outline / 4);
            ctx.fillText(phonetic,x + offset,outline / 4);

            x += bm.width;
            ruby_x = offset;
        }
        else
        {
            ctx.font = font;
            const pm = ctx.measureText(phonetic);

            ctx.lineWidth = outline;
            ctx.strokeText(phonetic,x,rubyheight + outline);
            ctx.fillText(phonetic,x,rubyheight + outline);

            x += pm.width;
            ruby_x += pm.width;
        }
    }
}
