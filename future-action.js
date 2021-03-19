/**
 * Component to queue up and execute future actions, in order to try and maintain a high frame rate.
 * <p>
 * This is very similar to <code>setTimeout</code>, but avoids multiple actions firing in the same frame.
 */

AFRAME.registerComponent( 'future-action', {
	init: function() {

		const self = this;
		this.futureActions = [];

		AFRAME.futureAction = function( callback, millis ) {

			const futureAction = {
				callback,
				millis
			};
			
			self.futureActions.push( futureAction );
			return futureAction;
		}

		AFRAME.cancelFutureAction = function( futureAction ) {

			const indexOf = self.futureActions.indexOf( futureAction );
			if ( indexOf >= 0 ) {
				self.futureActions.splice( indexOf, 1 );
			}
		}

		// Every 13ms is roughly 72Hz (1 frame for Oculus Quest)

		this.throttle = 14;
		this.tick = AFRAME.utils.throttleTick( this.tick, this.throttle, this );
	},

	tick: function() {

		// Decrement millis (if any) of all future actions...
		
		for( const action of this.futureActions ) {
			if ( action.millis !== undefined ) {
				action.millis -= this.throttle;
			}
		}
			
		// ...and execute the first cab off the rank
		
		for( let loop = 0; loop < this.futureActions.length; loop++ ) {
			const action = this.futureActions[loop];
			
			if ( action.millis !== undefined && action.millis > 0 ) {
				continue;
			}
			
			this.futureActions.splice( loop, 1 );
			action.callback();
			break;
		}
	}
} );
