
 
YUI.add('abortable-json-request', function(Y){ 
    
    function AbortableJSONRequest(oConfig){
        return this;
    }
    AbortableJSONRequest.NAME = 'abortable-json-request';
    
    AbortableJSONRequest.prototype = {
        
        send : function(oConfig){
            this.callback       = oConfig.callback;
            this.callback.scope = this.callback.scope || window;
            this.oLoadTimer     = Y.later(oConfig.timeout || 30000, this, this.abort);
            this.oLoadFrame     = document.createElement('iframe');
            this.oLoadFrame.style.display = 'none';
            document.body.appendChild(this.oLoadFrame);
            var win = this.oLoadFrame.contentWindow || this.oLoadFrame.contentDocument;
            var doc = win.document;
            // write empty html doc to new iframe
            doc.open();
            doc.write('<html><head></head><body></body></html>');
            doc.close();
            // need to scope correct through the iframe
            win.scope = this;
            win[oConfig.JSONCallback]   = function(o){
                win.scope.loaded.apply(win.scope, [o]);
            };
            // create and insert the script node
            this.oLoadScript        = doc.createElement('script');
            this.oLoadScript.src    = oConfig.src;
            doc.getElementsByTagName('head')[0].appendChild(this.oLoadScript);
            return this;
        },

        loaded : function(o){
            if(this.oLoadFrame && this.oLoadFrame.parentNode){ // double check for IE
                this.callback.success.apply(this.callback.scope, [o]);
                this.oLoadTimer.cancel();
                this.cleanUp();
            }
        },

        abort : function(bSuppressCallback){
            // abort the request by resetting iframe src and removing it
            this.oLoadFrame.src = '';
            this.cleanUp();
            // fire failure callback only if bSuppressCallback == false
            // bSuppressCallback may be required to abort externally without firing failure case
            if(bSuppressCallback){
                this.callback.failure = function(){};
            }
            if(this.callback.failure && !bSuppressCallback){
                this.callback.failure.apply(this.callback.scope, ['timeout']);
            }
        },

        cleanUp : function(){
            // destroy the loading iframe
            if(this.oLoadFrame && this.oLoadFrame.parentNode){
                Y.later(0, this, function(){ // setTimeout needed to force FF/Webkit to cancel the request
                    this.oLoadFrame.parentNode.removeChild(this.oLoadFrame);
                });
            }
        }
        
    };
    
    Y.AbortableJSONRequest = AbortableJSONRequest;
    
}, '1.0', {requires:['widget']});
