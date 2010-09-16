
/**
 *
 * AbortableJSONRequest class
 * <p>Usage: new YAHOO.util.AbortableJSONRequest().create('data.json', callback, JSONCallback, timeout);</p>
 * @class AbortableJSONRequest
 * @namespace YAHOO.util.AbortableJSONRequest
 * @constructor
 * @param {Object} callback
 *   {String} src JSONP resource to loa
 *   {Function} success (required) method called after request completes. passes data as argument
 *   {Function} failure (optional) method called after timeout. passes 'timeout' as argument
 *   {Function} scope (optional, defaults to window) scope to call success and failure in
 *   {String} JSONCallback (required) method name called by JSONP
 *   {integer} timeout (optional, defaults to 30 seconds) max time in milliseconds for request
 */
YAHOO.util.AbortableJSONRequest = function(){
    return this;
};    

YAHOO.util.AbortableJSONRequest.prototype = {    
        
    send : function(oConfig){
        this.callback       = oConfig.callback;
        this.callback.scope = this.callback.scope || window;
        this.oLoadTimer     = YAHOO.lang.later(oConfig.timeout || 30000, this, this.abort);
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
            YAHOO.lang.later(500, this, function(){ // setTimeout needed to force FF/Webkit to cancel the request
                this.oLoadFrame.parentNode.removeChild(this.oLoadFrame)
            });
        }
    }
    
};
