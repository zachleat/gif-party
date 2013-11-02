;(function() {

	// Keep looping until 4500ms have passed
	var SHOW_STATIC_IMGS = false,
		MIN_LOOPING = 6000,
		HASH_PREFIX = 'img';

	function removeNode( node ) {
		node.parentNode.removeChild( node );
	}

	function staticImg( imgs, index, node ) {
		var img = imgs[ index ],
			src = img.getAttribute( 'src' ),
			animatedSrc = img.getAttribute( 'rel:animated_src' );

		if( !SHOW_STATIC_IMGS ) {
			removeNode( node || img );
			loadGifs( imgs, ++index );
			return;
		}

		if( !src ) {
			img.className += ' inserted';
			if( animatedSrc ) {
				img.src = animatedSrc;
			}

			// TODO only timeout on load?
			window.setTimeout( function() {
				removeNode( node || img );
				loadGifs( imgs, ++index );
			}, MIN_LOOPING );
		}
	}

	function loadGifs( imgs, index ) {
		if( index >= imgs.length ) {
			// start over
			window.location.hash = HASH_PREFIX + "0";
			window.location.reload( true );
			return;
		}

		window.location.hash = HASH_PREFIX + index;

		var img = imgs[ index ],
			rub = new SuperGif({ gif: img });

		if( img.nodeName && img.nodeName === 'IMG' ) {
			if( ( img.getAttribute( 'src' ) || img.getAttribute( 'rel:animated_src' )).indexOf( '.gif' ) === -1 ) {
				staticImg( imgs, index );
				return;
			}
		}

		var start = new Date();

		rub.load(function(){
			var length = rub.get_length(),
				previousCurrent = 0,
				interval,
				canvas = rub.get_canvas();

			if( length === 1 ) {
				staticImg( imgs, index, canvas.parentNode );
				return;
			}

			if( new Date() - start > MIN_LOOPING ) {
				removeNode( canvas.parentNode );
				loadGifs( imgs, ++index );
				return;
			}

			interval = window.setInterval(function() {
				var current = rub.get_current_frame();

				if( current === length || previousCurrent > current ) {
					if( new Date() - start > MIN_LOOPING ) {
						window.clearInterval( interval );
						removeNode( canvas.parentNode );

						loadGifs( imgs, ++index );
					}
				}
				previousCurrent = current;
			}, 50 );
		});
	}

	function getIndexFromHash() {
		return parseInt( ( window.location.hash || '' ).substr( 1 + HASH_PREFIX.length ), 10 ) || 0;
	}

	var index = getIndexFromHash(),
		imgs = Array.prototype.slice.call( document.getElementsByTagName( 'img' ) );

	loadGifs( imgs, index );

	window.addEventListener( 'hashchange', function() {
		window.location.reload( true );
	}, false );
})();