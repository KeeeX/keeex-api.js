/*
Copyright (c) 2016 KeeeX SAS 

This is an open source project available under the MIT license.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

*/
var request = require("request");

var port = 8288;
var host = "http://localhost:" + port;
var apiBase = host + "/kx/api";
var uri = {
	hello: apiBase + "/hello",
	token: apiBase + "/token",
	topic: apiBase + "/topic",
	user: apiBase + "/user",
	util: apiBase + "/util",
	plugin: apiBase + "/plugin"
};
var token = null;

function handleResponse(error, response, body, callback) {
	if (error || response.statusCode !== 200)
		callback(error || new Error(response.statusCode + " " + body));
	else
  		callback(null, body);
}


/**
 * Set the authorisation token to the given value for future API request.
 * Usualy you won't have to set it by yourself as getToken will store it.
 *
 * @param {string} _token - The API token
 */
function setToken(_token) {
	token = _token;
}


/**
 * Test if the API is working
 * 
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened null if none
 * @param {String} callback.response - "hello world !"
 */
function hello(callback) {
	request(uri.hello, function (error, response, body) {
	  handleResponse(error, response, body, callback);
	});
}


/**
 * Ask an authentification token for the local API. It will be prompted to the user
 * if he wants to allow or deny the access
 * On success, it will automatically store the token for later use. No need to use setToken() afterward
 *
 * @param {string} appName - The application name
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened (deny), null if none
 * @param {Object} callback.response - The API response if everything is okay
 * @param {String} callback.response.token - The token to access the local API
 */
function getToken(appName, callback) {
	var self = this;
	request({
	  method: 'GET',
	  uri: uri.token,
	  json: {
	  	appName: appName
	  }
	},
	function (error, response, body) {
		if (!error && body && body.token) {
			token = body.token;
		}
		handleResponse(error, response, body, callback);
	});
}


/**
 * Keeex the given file with the parameters
 *
 * @param {String} path - Path of the file to keeex
 * @param {String[]} refs - Array of references (idx) for the document
 * @param {String[]} prevs - Array of idx of previous versions of the file
 * @param {String} description - The file description
 * @param {Object} option - Options for the operation
 * @param {String} option.targetFolder - Where the keeexed file will be stored. - Can be null and keeex will use the default folder
 * @param {boolean} option.timestamp - Put local creation time & ask for the topic to be timestamped on the bitcoin blockchain
 * @param {boolean} option.pattern - Put output filename pattern into metadata or not
 * @param {boolean} option.bitcoin - Put bitcoin signature into metadata or not
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {Object} callback.response - The API response if everything is okay
 * @param {String} callback.response.path - The keeexed file path
 * @param {keeex_topic} callback.response.topic - All informations about the topic created
 */
function keeex(path, refs, prevs, description, option, callback) {
	var opt = option || {};
	request({
	  method: 'POST',
	  uri: uri.topic + "/keeex",
	  json: {
	  	path: path,
	  	refs: refs,
	  	prevs: prevs,
		name: opt.name,
	  	description: description,
	  	option: opt
	  },
	  headers: {
			'Authorization': token
	  }
	},
	function (error, response, body) {
		handleResponse(error, response, body, callback);
	});
}


/**
 * Verify the file in keeex
 *
 * @param {string} path - Absolute path of the file to be verified
 * @param {object} opt - Additionnal settings
 * @param {boolean} opt.import - Add the verified file in keeex database (if valid)
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {Object} callback.response - The API response if everything is okay
 * @param {Integer} callback.response.verifiedStatus - 100 Keeexed / 101 Not keeexed / 102 keeexed but the file was modified
 * @param {string} callback.response.idx - idx of the file
 */
function verify(path, opt, callback) {
	request({
	  method: 'POST',
	  uri: uri.topic + "/verify",
	  json: {
	  	path: path,
			option: opt
	  },
	  headers: {
			'Authorization': token
	  }
	},
	function (error, response, body) {
		handleResponse(error, response, body, callback);
	});
}


/**
 * Get the informations about the given idxs
 *
 * @param {string[]} idx - Array of idx to fetch informations
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {keeex_topic[]} callback.response - List of topic info for the idxs given
 */
function getTopics(idxs, callback) {
	request({
	  method: 'GET',
	  uri: uri.topic,
	  json: {
	  	idxs: idxs
	  },
	  headers: {
			'Authorization': token
	  }
	},
	function (error, response, body) {
		handleResponse(error, response, body, callback);
	});
}


/**
 * Get all file locations keeex knows about the given idxs
 *
 * @param {string[]} idx - Array of idx to fetch the location 
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {Array} callback.response - The list of locations asked
 * @param {String} callback.response.idx - The topic idx
 * @param {String[]} callback.response.location - List of known locations by keeex
 */
function getLocations(idxs, callback) {
	request({
	  method: 'GET',
	  uri: uri.topic + "/locations",
	  json: {
	  	idxs: idxs
	  },
	  headers: {
			'Authorization': token
	  }
	},
	function (error, response, body) {
		handleResponse(error, response, body, callback);
	});
}


/**
 * Get the author of the given topic
 *
 * @param {string} idx - The topic idx
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {keeex_user} callback.response - The author of the document
 */
function getAuthor(idx, callback) {
	request({
	  method: 'GET',
	  uri: uri.topic + "/" + idx + "/author",
	  json: true,
	  headers: {
			'Authorization': token
	  }
	}, function (error, response, body) {
	  handleResponse(error, response, body, callback);
	});
}


/**
 * Get the list of comments on a given topic
 *
 * @param {string} idx - The topic idx
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {keeex_comment[]} callback.response - Comment list of the topic
 */
function getComments(idx, callback) {
	request({
		method: 'GET',
		uri: uri.topic + "/" + idx + "/comments",
		json: true,
	  headers: {
			'Authorization': token
	  }
	}, function (error, response, body) {
	  handleResponse(error, response, body, callback);
	});
}


/**
 * Post a comment on the given topic
 *
 * @param {string} idx - The topic idx
 * @param {string} message - The comment message
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {keeex_comment[]} callback.response - Comment list of the topic
 */
function comment(idx, message, callback) {
	request({
		method: 'POST',
		uri: uri.topic + "/" + idx + "/comment",
		json: {
			message: message
		},
	  headers: {
			'Authorization': token
	  }
	}, function (error, response, body) {
	  handleResponse(error, response, body, callback);
	});
}


/**
 * Get a list of the previous version(s) of a given topic
 *
 * @param {string} idx - The topic idx
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {keeex_topic[]} callback.response - List of previous versions
 */
function getPrevs(idx, callback) {
	request({
		method: 'GET',
		uri: uri.topic + "/" + idx + "/prevs",
		json: true,
	  headers: {
			'Authorization': token
	  }
	}, function (error, response, body) {
	  handleResponse(error, response, body, callback);
	});
}


/**
 * Get a list of the next version(s) of a given topic
 *
 * @param {string} idx - The topic idx
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {keeex_topic[]} callback.response - List of next versions
 */
function getNexts(idx, callback) {
	request({
		method: 'GET',
		uri: uri.topic + "/" + idx + "/nexts",
		json: true,
	  headers: {
			'Authorization': token
	  }
	}, function (error, response, body) {
	  handleResponse(error, response, body, callback);
	});
}


/**
 * Get a list of the all topics refering to the given one (including comments and previous versions)
 *
 * @param {string} idx - The topic idx
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {keeex_topic[]} callback.response - List of topic
 */
function getRefs(idx, callback) {
	request({
		method: 'GET',
		uri: uri.topic + "/" + idx + "/refs",
		json: true,
	  headers: {
			'Authorization': token
	  }
	}, function (error, response, body) {
	  handleResponse(error, response, body, callback);
	});
}


/**
 * Get a list of people that partici
 *
 * @param {string} idx - The topic idx
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {Object} callback.response - The API response if everything is okay
 * @param {String[]} callback.response.received - List of profile idx who reveived
 * @param {String[]} callback.response.shared - List of profile idx who are shared
 */
function getShared(idx, callback) {
	request({
		method: 'GET',
		uri: uri.topic + "/" + idx + "/shared",
		json: true,
	  headers: {
			'Authorization': token
	  }
	}, function (error, response, body) {
	  handleResponse(error, response, body, callback);
	});
}


/**
 * Get a list of the all topics refering to the given one
 *
 * @param {string} idx - The topic idx
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {keeex_user[]} callback.response - List of users who agreed
 */
function getAgreements(idx, callback) {
	request({
		method: 'GET',
		uri: uri.topic + "/" + idx + "/agreements",
		json: true,
	  headers: {
			'Authorization': token
	  }
	}, function (error, response, body) {
	  handleResponse(error, response, body, callback);
	});
}


/**
 * Share a topic 
 *
 * @param {string} idx - The topic idx
 * @param {string} path - Path of the file of the topic
 * @param {string[]} recipients - List of recipients idx
 * @param {Object} options - Sharing options
 * @param {String} options.email - Whether to send an email to the recipient or not
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {Object} callback.response - The API response if everything is okay
 * @param {String} callback.response.idx - Topic idx
 * @param {Object} callback.response.shared 
 * @param {String[]} callback.response.shared.shared - People who are shared
 * @param {String[]} callback.response.shared.received - People who received
 * @param {String} callback.response.link - Url to download the ciphred file 
 */
function share(idx, path, recipients, option, callback) {
	request({
	  method: 'POST',
	  uri: uri.topic + "/" + idx + "/share",
	  json: {
	  	path: path,
	  	recipients: recipients,
	  	option: option
	  },
	  headers: {
			'Authorization': token
	  }
	},
	function (error, response, body) {
		handleResponse(error, response, body, callback);
	});
}


/**
 * Make a reference 
 *
 * @param {string} type - The reference type ("reference", "version" or "agreement")
 * @param {string} from - The topic idx when type is "reference" or "version", null when "agreement"
 * @param {string} to - The topic idx
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 */
function makeRef(type, from, to, callback) {
	request({
	  method: 'POST',
	  uri: uri.topic + "/makeRef",
	  json: {
	  	type: type,
	  	from: from,
	  	to: to
	  },
	  headers: {
			'Authorization': token
	  }
	},
	function (error, response, body) {
		handleResponse(error, response, body, callback);
	});
}


/**
 * Remove a topic from database
 *
 * @param {string} idx - The topic idx to remove
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 */
function remove(idx, callback) {
	request({
	  method: 'POST',
	  uri: uri.topic + "/" + idx + "/remove",
	  json: true,
	  headers: {
			'Authorization': token
	  }
	},
	function (error, response, body) {
		handleResponse(error, response, body, callback);
	});
}


/**
 * Get current user informations
 *
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {function} callback.error - Any error that could have happened, null if none
 * @param {keeex_user} callback.response - The user's info
 */
function getMine(callback) {
	request({
	  method: 'GET',
	  uri: uri.user + "/me",
	  json: true,
	  headers: {
			'Authorization': token
	  }
	},
	function (error, response, body) {
		handleResponse(error, response, body, callback);
	});
}


/**
 * Get users info froma list of profile idxs
 *
 * @param {string[]} idx - List of idx
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {keeex_user[]} callback.response - Users' info
 */
function getUsers(idxs, callback) {
	request({
	  method: 'GET',
	  uri: uri.user,
	  json: {
	  	idxs: idxs
	  },
	  headers: {
			'Authorization': token
	  }
	},
	function (error, response, body) {
		handleResponse(error, response, body, callback);
	});
}


/**
 * Get users info froma list of profile idxs
 *
 * @param {string} email - The email of an user
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {keeex_user} callback.response - User's info
 */
function getUserByEmail(email, callback) {
	request({
	  method: 'GET',
	  uri: uri.user + "/email/" + email,
	  json: true,
	  headers: {
			'Authorization': token
	  }
	},
	function (error, response, body) {
		handleResponse(error, response, body, callback);
	});
}


/**
 * Generate a file, usefull when you want to create a keeex message
 *
 * @param {string} name - The file name
 * @param {string} description - The file description
 * @param {string} target - Path of the destination folder
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {Object} callback.response 
 * @param {String} callback.response.file - Path of the created file
 */
function generateFile(name, description, target, callback) {
	request({
	  method: 'POST',
	  uri: uri.util + "/generateFile",
	  json: {
	  	name: name,
			description: description,
			target: target
	  },
	  headers: {
			'Authorization': token
	  }
	},
	function (error, response, body) {
	  handleResponse(error, response, body, callback);
	});
}


/**
 * Get current user informations
 *
 * @param {String} filter - Text used to search
 * @param {String[]} topic - List of topics referenced (AND search)
 * @param {String[]} negTopic - List of topics not referenced (NOT search)
 * @param {Integer} skip - Number of topics to be skiped from search results
 * @param {Integer} limit - Maximum number of topics returned by search
 * @param {Object} option - Search options
 * @param {boolean} option.document - Search for a document or not 
 * @param {boolean} option.discussion - Search for a discussion or not
 * @param {boolean} option.comment - Search for a comment or not
 * @param {boolean} option.agreed - Search for a keeex agreement or not
 * @param {boolean} option.concept - Search for a keeex concept or not
 * @param {boolean} option.older_version - Search for old versions or not
 * @param {boolean} option.description - Search in topic description or not
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {keeex_topic[]} callback.response - List of topic found
 */
function search(filter, topics, negTopics, skip, limit, option, callback) {
	request({
	  method: 'POST',
	  uri: uri.util + "/search",
	  json: {
	  	filter: filter,
	    topics: topics,
	    negTopics: negTopics,
	    skip: skip,
	    limit: limit,
	    option: option
	  },
	  headers: {
			'Authorization': token
	  }
	},
	function (error, response, body) {
	  handleResponse(error, response, body, callback);
	});
}


/**
 * Get the idx of the document/topic curently displayed in keeex
 *
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {String[]} callback.err - Any error that could have happened, null if none
 * @param {Object} callback.body -Response content
 * @param {String} callback.body.idx -Topic idx
 */
function getCurrentView(callback) {
	request({
	  method: 'GET',
	  uri: uri.util + "/currentView",
	  json: true,
	  headers: {
			'Authorization': token
	  }
	},
	function (error, response, body) {
		handleResponse(error, response, body, callback);
	});
}


/**
 * Get the value of a keeex environment variable
 *
 * @param {String} name - The variable name. It can be **DATA_PATH**, **KEEEX_PATH**, **KEEEXED_PATH**, **RECEIVED_PATH**, **FILENAME_FORMAT**
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {Object} callback.response
 * @param {String} callback.response.value - The value of the environment variable
 */
function getEnv(name, callback) {
	request({
	  method: 'GET',
	  uri: uri.util + "/env" + "/" + name,
	  json: true,
	  headers: {
			'Authorization': token
	  }
	},
	function (error, response, body) {
		handleResponse(error, response, body, callback);
	});
}


/**
 * Set the value of a keeex environment variable
 *
 * @param {String} name - The variable name. It can be **KEEEXED_PATH**, **RECEIVED_PATH**, **FILENAME_FORMAT**
 * @param {String} value - The variable value
 * @param {function} callback - Callback that you'll have to implement, it will handle the response
 * @param {Array} callback.error - Any error that could have happened, null if none
 * @param {null} callback.response
 */
function setEnv(name, value, callback) {
	request({
	  method: 'POST',
	  uri: uri.util + "/env" + "/" + name,
	  json: {
	  	value: value
	  },
	  headers: {
			'Authorization': token
	  }
	},
	function (error, response, body) {
		handleResponse(error, response, body, callback);
	});	
}

module.exports = {
	hello: hello,
	setToken: setToken,
	getToken: getToken,
	keeex: keeex,
	verify: verify,
	getTopics: getTopics,
	getLocations: getLocations,
	getAuthor: getAuthor,
	getComments: getComments,
	comment: comment,
	getPrevs: getPrevs,
	getNexts: getNexts,
	getRefs: getRefs,
	getShared: getShared,
	getAgreements: getAgreements,
	getUsers: getUsers,
	getMine: getMine,
	getUserByEmail: getUserByEmail,
	share: share,
	makeRef: makeRef,
	remove: remove,
	generateFile: generateFile,
	search: search,
	getCurrentView: getCurrentView,
	getEnv: getEnv,
	setEnv: setEnv,
};


/**
 * 
 * @typedef keeex_topic
 * @property {String} idx - Topic identifier
 * @property {String} name - Topic name - the same file name
 * @property {String} description - Topic description
 * @property {Date} creationDate - Topic creation date
 * @property {Date} lastModify - Topic last modification date
 * @property {String[]} references - list of idx of references
 */

/**
 * It's the same structure as a topic as comments are keeex topics too
 * @typedef keeex_comment
 * @property {String} idx - Topic identifier
 * @property {String} name - Comment content
 * @property {String} description - Empty
 * @property {Date} creationDate - Topic creation date
 * @property {Date} lastModify - Topic last modification date
 * @property {String[]} references - list of idx of references
 */

/**
 * 
 * @typedef keeex_user
 * @property {String} profileIdx - User identifier
 * @property {String} name - User name
 * @property {String} avatar - Path to user's avatar
 * @property {email} email - User's email
 */