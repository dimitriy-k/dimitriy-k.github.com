var monthNames = [ "January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December" ];
    
ko.bindingHandlers.dateString = {
    update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        var valueUnwrapped = ko.utils.unwrapObservable(value);
         
        var value = new Date(valueAccessor());
        var strDate = value.getDate() + " "+ monthNames[value.getMonth()] + " " + value.getFullYear()+"  "+ value.getHours()+":"+value.getMinutes();              

        $(element).text(strDate);
    }
}
 
var ChatListModel = function() {
    this.selectedUser = ko.observable("");
    this.sendToAll = ko.observable(false);
    this.host = ko.observable(host);
    this.usersList =  ko.observableArray();
    this.receiversList =  ko.observableArray([]);
    this.userNameToAdd = ko.observable("");
    this.messageToSend = ko.observable("");
    this.selectedReceiver = ko.observable("");
 	this.messages = ko.observableArray([]);
 	this.allMessages = ko.observableArray([]);
 	this.refreshTimeout;
 	this.resizeTimer;
 	this.messagesToLoad = 0;
 	this.messagesMode = ko.observable(false);
 	
    this.addUser = function() {
        if (this.userNameToAdd() && this.userNameToAddIsValid()) {
             this.usersList.push({"name":this.userNameToAdd()});
             chatApi.addUser(this.userNameToAdd());
             this.userNameToAdd("");
        }
    };
    
    this.sendMessage = function() {
        if (this.messageToSend()) {
             var message = {"timestamp": (new Date()),"sender": this.selectedUser().name,"content": this.messageToSend()}
             
             var receivers = [this.selectedReceiver()];
             
            
             if(this.sendToAll()) receivers = this.receiversList();
             
             chatApi.sendMessage(message,receivers,null);
             this.messageToSend("");
        }
    };
    
    this.changeHost = function() {
        if (this.host().length == 0)return; 
		
		host = this.host();
		
		chatApi.getUsers(this.usersList,this.loadUserMessages,true);
    };
 
    this.loadUserMessages = function(obj) { 
    	 if(this.usersList().length == 0)return;
    	 if(obj != null){
    		 this.receiversList($.grep(this.usersList() || [], function (user) { return user.name != obj.name; }));
    		 this.selectedUser(obj);
    	 }

    	 if(this.messagesMode()){
    	 	this.messagesToLoad = this.usersList().length;
    	 	this.allMessages([]);
    	 	chatApi.getMessagesForUsers(this.usersList(), this.messagesLoaded);
    	 }else{
    	 	chatApi.getMessagesForUser(this.selectedUser(), this.messages);
    	 }
    	 
    	 clearTimeout(this.refreshTimeout);
    	 var self = this;
    	 this.refreshTimeout = setTimeout(function () {
    	 	chatApi.getUsers(self.usersList,self.loadUserMessages, false);
    	 }, 3000);
    }.bind(this);
    
    this.messagesLoaded = function(data) { 
    	 $.merge(this.allMessages(),data);

    	 this.messagesToLoad--
    	 if(this.messagesToLoad == 0)
    	 	this.updateAllMessages();            
    }.bind(this);
    
    this.updateAllMessages = function() {
        this.allMessages().sort(function(a,b){
			var c = new Date(a.timestamp);
			var d = new Date(b.timestamp);
			return c-d;
		});
         
        this.messages( this.allMessages().reverse())
    };
 
    this.userNameToAddIsValid = ko.computed(function() {
        return (this.userNameToAdd() == "") || (this.userNameToAdd().match(/^\s*[a-zA-Z0-9_]{1,15}\s*$/) != null);
    }, this);
 
    this.canAddUserName = ko.computed(function() {
        return this.userNameToAddIsValid() && this.userNameToAdd() != "";
    }, this);
    
    this.canSendMessage = ko.computed(function() {
        return this.messageToSend() != "";
    }, this);
    
    this.setBoxSize = function(){
    	var windowHeight = $(document).height();
    	var mainHeight = (windowHeight-20 > 620)? windowHeight-20 : 621;
    	$("#main").height(mainHeight);
    	
    	
    	var usersListHeight = $(window).height()-407;
    	if(usersListHeight < 235) usersListHeight = 235;
  		$("#usersList").height(usersListHeight);
  		
    };
    
    this.messageLength =  ko.computed(function(){
    	 return (this.messages().length == 0);
    }, this);
    
    this.messagesForUser = function(){
    	$(".currentMessageMode").removeClass("currentMessageMode");
    	$(".messagesUsers").addClass("currentMessageMode"); 
    	this.messagesMode(false);
    	this.loadUserMessages(this.selectedUser());
    };
    
    this.messagesForAllUsers = function(){
    	$(".currentMessageMode").removeClass("currentMessageMode");
    	$(".messagesAll").addClass("currentMessageMode"); 
    	this.messagesMode(true);
    	this.loadUserMessages();
    };
    
    ko.computed(function() {
  		var self = this;
  		
  		$(window).resize(function() {
			clearTimeout(self.resizeTimer);
			self.resizeTimer = setTimeout(function(){self.setBoxSize()}, 5);
		});
		
		$(window).trigger("resize");

  		chatApi.getUsers(this.usersList,this.loadUserMessages, true);
    }, this);
};

ko.applyBindings(new ChatListModel());


 

