var Matcher = (function() {

	function Matcher(extension) {
		extend(this, extension);

		if (!(isMatcher(this))) {
			throw Error('this is not a matcher object');
		}

		this._children = [];
	}

	function isMatcher(x) {
		return x instanceof Matcher && isFunction(x.isMatch);
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
	 * @param {Matcher} matcher child matcher object
	 */
	MatcherPrototype.add = function(child) {
		if (!isMatcher(child)) {
			throw Error('child is not a matcher object');
		}
		this._children.push(child);
	}

	MatcherPrototype.match = function(x) {
		if (this.isMatch(x)) {
			this.onMatch && this.onMatch(x, this);
			return true;
		}
		// else
		return false;
	}

	return Matcher;
}());
