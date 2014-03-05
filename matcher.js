var Matcher = (function() {

	/**
	 * Matcher constructor. Extension should contain isMatch method and optionally onMatch callback
	 */
	function Matcher(extension) {
		extend(this, extension);
		if (!(isMatcher(this))) {
			throw Error('this is not a matcher object');
		}
		this._children = [];
	}

	function isMatcher(m) {
		return m instanceof Matcher && isFunction(m.isMatch);
	}

	function isFunction(f) {
		return typeof f == 'function';
	}

	function extend(target, source) {
		for (var i in source) {
			if (source.hasOwnProperty(i)) {
				target[i] = source[i];
			}
		}
		return target;
	}

	MatcherPrototype = Matcher.prototype;

	/**
	 * Add a child matcher object
	 */
	MatcherPrototype.add = function(child) {
		if (!isMatcher(child)) {
			throw Error('child is not a matcher object');
		}
		this._children.push(child);
	}

	/**
	 * Return if item is a match (and call onMatch method for deepest match)
	 */
	MatcherPrototype.match = function(x) {
		return this._match(x, [])
	}

	MatcherPrototype._match = function(x, chain) {
		if (this.isMatch(x)) {
			chain.push(this);
			var children = this._children;
			for (var i = 0, l = children.length; i < l; ++i) {
				var child = children[i];
				if (child._match(x, chain)) {
					return true;
				}
			}
			// else, no child matched
			this.onMatch && this.onMatch(x, this, chain);
			return true;
		}
		// else
		return false;
	}

	return Matcher;
}());
