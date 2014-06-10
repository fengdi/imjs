
define(function(){
    
    
    function Attributes(){}
    
    Attributes.prototype.attrInit = function(){
        this.on("before:set()", function(name, value){
        
        });
        this.on("after:set()", function(name, value){
            
        });
        
        this.on("before:get()", function(name){
        
        });
        this.on("after:get()", function(name){
            
        });
    };
    
    Attributes.prototype.set = function(name, value){
        return setValueByPath(this, name, value);
    };
    
    Attributes.prototype.get = function(name){
        return getValueByPath(this, name);
    };
    
    
    // - from: https://gist.github.com/fengdi/5330459
    
    function setValueByPath(obj, path, value){
        var temp, k, re = obj;

        if(!obj || (typeof obj!="object" && typeof obj!="function"))
        return obj;

        (path+"").replace(/([^.:]+)([.:])?/g, function(m, n, sign){
            temp = obj;
            k = n;
            obj = obj[n] = (obj!=void 0 && (typeof obj=="object" || typeof obj=="function") && n in obj) ? obj[n] : sign ==":" ?  [] : {};
        });

        if(k && temp){
            temp[k] = value;
        }
        return re;
    }
    
    
    // - from: https://gist.github.com/fengdi/5326735
    
    function getValueByPath(obj, path){
        (path+"").replace(/[^.:]+/g,function(n){
        obj = (obj!=void 0 && (typeof obj=="object" || typeof obj=="function") && n in obj) ? obj[n] : void 0;
        });
        return obj;
    }
    
    
    
    return Attributes;

});