function lang_init(obj,target){
  if (obj == null) {
    obj = $(document);
  } else {
    obj = $(obj);
  }
  $(target).empty();
  let langSelect = new Set();
  $("[lang]", obj).each(function(){
    if(langSelect.has($(this).attr("lang"))){ return true; }
    $(target).append("<span class=\"lang-select-item\" data-lang="+$(this).attr("lang")+">"+countryCodeToUTF8Flag($(this).attr("lang"))+"</span>");
    langSelect.add($(this).attr("lang"));
  });
  if(langSelect.size <= 1){
    $(target).hide();
    return;
  }
  $(target).show();
  displayLang($("html").attr("lang"), obj);
  $(".lang-select-item").click(function(){
    $("html").attr("lang", $(this).data("lang"));
    let lang = $("html").attr("lang");
    displayLang(lang);
  });
}

function displayLang(lang, obj){
  if(obj == null) obj = $(document);
  let elementsWithLangAttr = new Set();
  let elementIdsLangTrue = new Set();
  $("[lang]").each(function(){
    if($(this).is("html")){
      return true;
    }
    elementsWithLangAttr.add($(this).attr("id"));
    if($(this).attr("lang") != lang){
      $(this).hide();
    }else{
      $(this).show();
      elementIdsLangTrue.add($(this).attr("id"));
    }
  });
  let elemWithLangAttrArr = Array.from(elementsWithLangAttr);
  let elemIdsLangFalse = elemWithLangAttrArr.filter(x => !elementIdsLangTrue.has(x));
  elemIdsLangFalse.forEach(function(x){
    $("#"+x).first().show();
  });
}

function countryCodeToUTF8Flag(code){
  let charCodeA = "A".charCodeAt(0);
  let utf8CountryIndicatorA = 127462;
  let langCode = code;
  let langFlagMap = new Map([["en", "gb"]]);
  if(langFlagMap.has(code.toLowerCase())){
    langCode = langFlagMap.get(code);
  }
  const utf8CountryIndicator = function(letter) {return (letter.toUpperCase().charCodeAt(0) - charCodeA) + utf8CountryIndicatorA;}
  let firstIndicator = utf8CountryIndicator(langCode.charAt(0));
  let secondIndicator = utf8CountryIndicator(langCode.charAt(1));
  return "&#" + firstIndicator + ";&#" + secondIndicator + ";";
}

function fitTextToDiv(divTextElem, divFitToHeight, divFitToWidth){
  let measureDiv = $('<div/>').text(divTextElem.text()).css("font-size", divTextElem.css("font-size"));
  console.log($(this));
  divTextElem.css("font-size", parseInt(divTextElem.css("font-size"))*divFitToWidth/divTextElem.width());
  if(divTextElem.height() > divFitToHeight){
    divTextElem.css("font-size", parseInt(divTextElem.css("font-size"))*divFitToHeight/divTextElem.height());
  }
}
