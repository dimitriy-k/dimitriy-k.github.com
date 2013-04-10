var host = "http://luminisjschallenge.herokuapp.com/";
//var host = "http://luminisjschallenge-server.azurewebsites.net/"; //Tim Schlechter
//var host = "http://planetmarrs.xs4all.nl:8787/server/"; //marcel

window.chatApi = (function () {
    var throttleFunction = function (fn, throttleMilliseconds) {
        var invocationTimeout;

        return function () {
            var args = arguments;
            if (invocationTimeout){
                clearTimeout(invocationTimeout);
			}
			
            invocationTimeout = setTimeout(function () {
                invocationTimeout = null;
                fn.apply(window, args);
            }, throttleMilliseconds);
        };
    };

    var getMessagesForUsersThrottled = throttleFunction(function (userNames, callback) {
        if (userNames.length == 0){
            callback([]);
        }else {
            for (var i = 0, len = userNames.length; i < len; i++){
				var name = userNames[i].name;
				loadMessage(name, callback);

				}
      	  }
    }, 50);
    
    var loadMessage = function(name, callback){
    	$.ajax({
			url: host+name,
			dataType: "json",
			success: function (data) { 
				var results = $.map(data, function(obj){ obj.receiver = name; return obj;} );
				callback(results.reverse());
				}
		});
	}

    return {
        getMessagesForUser: function (userName, callback) {
            return this.getMessagesForUsers([userName], callback);
        },
        getMessagesForUsers: function (userNames, callback) {
            return getMessagesForUsersThrottled(userNames, callback);
        },
        addUser: function (userName, callback) {
            if (userName.length == 0) return;
			
			$.post(host,{"name":userName},function (data) { 
						//callback(data); 	
				}
			);
        },
        sendMessage: function (message,receiversList, callback) {
				for (var i = 0, len = receiversList.length; i < len; i++){
					var url = host+receiversList[i].name;
					$.post(url,message,function (data) { 
						}
					);

				}
				
				
				
			
			return;
        },
        getUsers: function (callback, callback2,startup) {
		 	$.getJSON( host, function(data){
					callback(data);
					var user = data[0];
					if(!startup) user = null;
					callback2(user);
			  	}
			);
        }
    };
})();