var matcher;
var child;

module('Matcher constructor');

test('should exist and be a function', function() {
	equal(typeof Matcher, 'function', 'constructor function exists');
});

test('should extend itself with object sent to constructor', function() {
	var matcher = new Matcher({
		a: 'a',
		b: 'b',
		c: 'c',
		isMatch: function() { return true; },
		onMatch: function() {}
	});
	equal(matcher.a, 'a');
	equal(matcher.b, 'b');
	equal(matcher.c, 'c');
});

test('should throw exception if extension object has no isMatch function', function() {
	function test() {
		var matcher = new Matcher({
			a: 'a',
			b: 'b',
			c: 'c'
		});
	}
	throws(test);
});

module('Matcher object', {
	setup: function() {
		matcher = new Matcher({
			isMatch: function(x) {
				return true;
			}
		});
	}
});

test('should start off with no child matchers', function() {
	equal(matcher._children.length, 0);
});

test('should have an inherited add method', function() {
	equal(typeof matcher.add, 'function');
});

test('should be able to add a child matcher object', function() {
	var child = new Matcher({
		isMatch: function() { return true; }
	});
	matcher.add(child);
	equal(matcher._children.length, 1);
});

test('should be able to add multiple child matcher objects', function() {
	var child1 = new Matcher({
		isMatch: function() { return true; }
	});
	var child2 = new Matcher({
		isMatch: function() { return true; }
	});
	matcher.add(child1);
	matcher.add(child2);
	equal(matcher._children.length, 2);
});

test('should throw an exception if we try to add a non-matcher child', function() {
	function test() {
		matcher.add({
			a: 'a',
			b: 'b',
			c: 'c'
		});
	}
	throws(test);
});

module('Matcher with no children', {
	setup: function() {
		matcher = new Matcher({
			isMatch: function(x) {
				return x % 2 == 0; // match even numbers
			}
		});
	}
});

test('should return true if item is a match', function() {
	equal(matcher.match(0), true);
	equal(matcher.match(2), true);
	equal(matcher.match(4), true);
});

test('should return false if item is not a match', function() {
	equal(matcher.match(1), false);
	equal(matcher.match(3), false);
	equal(matcher.match(5), false);
});

test('should call onMatch method if item is a match', function(done) {
	expect(1);
	matcher.onMatch = function(x) {
		equal(x, 2);
	}
	matcher.match(2);
});

test('should not call onMatch method if item is not a match', function() {
	expect(0);
	matcher.onMatch = function(x) {
		ok(true);
	}
	matcher.match(1);
});
