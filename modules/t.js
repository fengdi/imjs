
define(function() {

	var blockregex = /\{\{(([@!]?)(.+?))\}\}(([\s\S]+?)(\{\{:\1\}\}([\s\S]+?))?)\{\{\/\1\}\}/g,
		valregex = /\{\{([=%])(.+?)\}\}/g;

	function t(template) {
		this.t = template;
	}

	function scrub(val) {
		var encodeHTMLRules = {
			"&": "&#38;",
			"<": "&#60;",
			">": "&#62;",
			'"': '&#34;',
			"'": '&#39;',
			"/": '&#47;'
		};
		return (""+val).replace(/&(?!#?\w+;)|<|>|"|'|\//g,function(m) {
			return encodeHTMLRules[m] || m;
		});
	}

	function get_value(obj, path){
		(path+"").replace(/[^.]+/g,function(n){
			obj = (obj!=void 0 && typeof obj=="object" && n in obj) ? obj[n] : void 0;
	    });
		return obj;
	}

	function render(fragment, vars) {
		return fragment
			.replace(blockregex, function(_, __, meta, key, inner, if_true, has_else, if_false) {

				var val = get_value(vars,key), temp = "", i;

				if (!val) {

					// handle if not
					if (meta == '!') {
						return render(inner, vars);
					}
					// check for else
					if (has_else) {
						return render(if_false, vars);
					}

					return "";
				}

				// regular if
				if (!meta) {
					return render(if_true, vars);
				}

				// process array/obj iteration
				if (meta == '@') {
					for (i in val) {
						if (val.hasOwnProperty(i)) {
							vars._key = i;
							vars._val = val[i];
							temp += render(inner, vars);
						}
					}
					delete vars._key;
					delete vars._val;
					return temp;
				}

			})
			.replace(valregex, function(_, meta, key) {
				var val = get_value(vars,key);

				if (val || val === 0) {
					return meta == '%' ? scrub(val) : val;
				}
				return "";
			});
	}

	t.prototype.render = function (vars) {
		return render(this.t, vars);
	};

  return t;
  
});


