function pug_attr(t,e,n,f){return e!==!1&&null!=e&&(e||"class"!==t&&"style"!==t)?e===!0?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||e.indexOf('"')===-1)?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (names, points, total) {pug_html = pug_html + "\u003C!DOCTYPE html\u003E\u003Chtml\u003E\u003Chead\u003E\u003Ctitle\u003E" + (pug_escape(null == (pug_interp = "Questions") ? "" : pug_interp)) + "\u003C\u002Ftitle\u003E\u003Clink rel=\"stylesheet\" href=\"\u002Fcss\u002Fbootstrap.min.css\"\u003E\u003Clink rel=\"stylesheet\" href=\"\u002Fcss\u002Fcustom.css\"\u003E\u003Cscript src=\"\u002Fjs\u002Fjquery.min.js\"\u003E\u003C\u002Fscript\u003E\u003Cscript src=\"\u002Fjs\u002Fbootstrap.min.js\"\u003E\u003C\u002Fscript\u003E\u003Cscript src=\"\u002Fjs\u002Fsubmissions.js\"\u003E\u003C\u002Fscript\u003E\u003Cscript src=\"\u002Fjs\u002Fcommon.js\"\u003E\u003C\u002Fscript\u003E\u003Cmeta name=\"viewport\" content=\"width=device-width, initial-scale=1\"\u003E\u003C\u002Fhead\u003E\u003Cbody\u003E\u003Cdiv class=\"container\"\u003E\u003Cdiv class=\"row\"\u003E\u003Cdiv class=\"col-xs-4\"\u003E\u003Ch1\u003E" + (pug_escape(null == (pug_interp = 'Questions') ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003Cdiv class=\"col-xs-8 vertical-center\"\u003E\u003Cdiv class=\"btn-group\" role=\"group\"\u003E\u003Ca class=\"btn btn-default\" href=\"\u002Fsubmissions\" role=\"button\" style=\"outline: none;\"\u003ESubmissions\u003C\u002Fa\u003E\u003Ca class=\"btn btn-default active\" href=\"\u002Fquestions\" role=\"button\"\u003EQuestions\u003C\u002Fa\u003E\u003Ca class=\"btn btn-default\" href=\"\u002Fdashboard\" role=\"button\"\u003EDashboard\u003C\u002Fa\u003E\u003Ca class=\"btn btn-default\" href=\"\u002Flogout\" role=\"button\"\u003ELogout\u003C\u002Fa\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Cbr\u003E\u003Cdiv class=\"row\"\u003E\u003Cdiv class=\"col-md-10 col-md-offset-1 list-group\"\u003E";
for (var i=1; i<=total; i++) {
pug_html = pug_html + "\u003Ca" + (" class=\"list-group-item list-group-item-action\""+pug_attr("href", ("/"+i), true, true)+" type=\"button\"") + "\u003E" + (pug_escape(null == (pug_interp = "Question #"+i) ? "" : pug_interp)) + "\u003Cspan style=\"padding-left: 10px;\"\u003E" + (pug_escape(null == (pug_interp = names[i]) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003Cspan style=\"float: right;\"\u003E" + (pug_escape(null == (pug_interp = "Points: " + points[i]) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fa\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fbody\u003E\u003C\u002Fhtml\u003E";}.call(this,"names" in locals_for_with?locals_for_with.names:typeof names!=="undefined"?names:undefined,"points" in locals_for_with?locals_for_with.points:typeof points!=="undefined"?points:undefined,"total" in locals_for_with?locals_for_with.total:typeof total!=="undefined"?total:undefined));;return pug_html;}