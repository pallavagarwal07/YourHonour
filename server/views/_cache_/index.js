function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (author) {pug_html = pug_html + "\u003Chead\u003E\u003Ctitle\u003E" + (pug_escape(null == (pug_interp = author) ? "" : pug_interp)) + "\u003C\u002Ftitle\u003E\u003C\u002Fhead\u003E\u003Cbody\u003E\u003CHi\u003Ethere\u003C\u002FHi\u003E\u003C\u002Fbody\u003E";}.call(this,"author" in locals_for_with?locals_for_with.author:typeof author!=="undefined"?author:undefined));;return pug_html;}