import { Injectable } from '@angular/core';
declare var Parse: any;

@Injectable()
export class ParseService {
  subscription: any;

  constructor() {
    Parse.initialize("myAppId", "unused");
    Parse.serverURL = 'https://iter-parse.herokuapp.com/parse';
    // Parse.serverURL = 'http://localhost:5000/parse';
  }

  public isLoggedIn() {
    return Parse.User.current();
  }

  public signIn(username: string, password: string) {
    let promise = new Parse.Promise();
    Parse.User.logIn(username, password).then(function(user: any) {
      // console.log(JSON.parse(JSON.stringify(user)));
      promise.resolve([true, user]);
    }, function(error: any) {
      // console.log(error);
      promise.resolve([false, error]);
    });
    return promise;
  }

  public signOut() {
    let promise = new Parse.Promise();
    Parse.User.logOut().then(function(result: any) {
      // console.log(result);
      promise.resolve([true, result]);
    }, function(error: any) {
      // console.log(error);
      promise.resolve([false, error]);
    });
    return promise;
  }

  public query(queryParams: any) {
    let promise = new Parse.Promise();
    let query = new Parse.Query(queryParams.className);
    // console.log('Class: ', queryParams.className);
    if ('constraints' in queryParams) {
      if ('equalTo' in queryParams.constraints) {
        for (let key in queryParams.constraints.equalTo) {
          query.equalTo(key, queryParams.constraints.equalTo[key]);
          // console.log('Equal to: ' + key + ' => ' + queryParams.constraints.equalTo[key]);
        }
      }
      if ('notEqualTo' in queryParams.constraints) {
        for (let key in queryParams.constraints.notEqualTo) {
          query.notEqualTo(key, queryParams.constraints.notEqualTo[key]);
          // console.log('Not equal to: ' + key + ' => ' + queryParams.constraints.notEqualTo[key]);
        }
      }
      if ('greaterThanOrEqualTo' in queryParams.constraints) {
        for (let key in queryParams.constraints.greaterThanOrEqualTo) {
          query.greaterThanOrEqualTo(key, queryParams.constraints.greaterThanOrEqualTo[key]);
          // console.log('Greater than or equal to: ' + key + ' => ' + queryParams.constraints.greaterThanOrEqualTo[key]);
        }
      }
      if ('lessThan' in queryParams.constraints) {
        for (let key in queryParams.constraints.lessThan) {
          query.lessThan(key, queryParams.constraints.lessThan[key]);
          // console.log('Less than: ' + key + ' => ' + queryParams.constraints.lessThan[key]);
        }
      }
      if ('notContainedIn' in queryParams.constraints) {
        for (let key in queryParams.constraints.notContainedIn) {
          query.notContainedIn(key, queryParams.constraints.notContainedIn[key]);
          // console.log('Not contained in: ' + key + ' => ' + queryParams.constraints.notContainedIn[key]);
        }
      }
      if ('containedIn' in queryParams.constraints) {
        for (let key in queryParams.constraints.containedIn) {
          query.containedIn(key, queryParams.constraints.containedIn[key]);
          // console.log('Contained in: ' + key + ' => ' + queryParams.constraints.containedIn[key]);
        }
      }
      if ('near' in queryParams.constraints) {
        for (let key in queryParams.constraints.near) {
          query.near(key, queryParams.constraints.near[key]);
          // console.log('Near: ' + key + ' => ' + queryParams.constraints.near[key]);
        }
      }
      if ('descending' in queryParams.constraints) {
        query.descending(queryParams.constraints.descending);
        // console.log('Descending: ', queryParams.constraints.descending);
      }
      if ('ascending' in queryParams.constraints) {
        query.ascending(queryParams.constraints.ascending);
        // console.log('Ascending: ', queryParams.constraints.ascending);
      }
      if ('select' in queryParams.constraints) {
        query.select(queryParams.constraints.select);
        // console.log('Select: ', queryParams.constraints.select);
      }
      if ('include' in queryParams.constraints) {
        query.include(queryParams.constraints.include);
        // console.log('Include: ', queryParams.constraints.include);
      }
      if ('exists' in queryParams.constraints) {
        for (let i = 0; i < queryParams.constraints.exists.length; i++) {
          query.exists(queryParams.constraints.exists[i]);
        }
        // console.log('Exists: ', queryParams.constraints.exists);
      }
      if ('doesNotExist' in queryParams.constraints) {
        for (let i = 0; i < queryParams.constraints.doesNotExist.length; i++) {
          query.doesNotExist(queryParams.constraints.doesNotExist[i]);
        }
        // console.log('Does not exist: ', queryParams.constraints.doesNotExist);
      }
      if ('limit' in queryParams.constraints) {
        query.limit(queryParams.constraints.limit);
        // console.log('Limit: ', queryParams.constraints.limit);
      }
      if ('skip' in queryParams.constraints) {
        query.skip(queryParams.constraints.skip);
        // console.log('skip: ', queryParams.constraints.skip);
      }
    }
    if (queryParams.subscribe) {
      this.subscription = query.subscribe();
      console.log('Subscribing to query');
      if ('eventHandling' in queryParams) {
        for (let key in queryParams.eventHandling) {
          this.subscription.on(key, queryParams.eventHandling[key]);
          console.log('Event Handling: ' + key + ' => ' + queryParams.eventHandling[key]);
        }
      }
    }
    // console.log('Search: ', queryParams.search);
    switch (queryParams.search) {
      case 'first':
      query.first().then(function(result: any) {
        // console.log(JSON.parse(JSON.stringify(result)));
        if (result !== undefined) {
          promise.resolve([true, result]);
        } else {
          promise.resolve([false, result]);
        }
      }, function(error: any) {
        // console.log(error);
        promise.resolve([false, error]);
      });
      break;

      case 'find':
      query.find().then(function(result: any) {
        // console.log(JSON.parse(JSON.stringify(result)));
        if (!(Object.keys(result).length === 0 && result.constructor === Object)) {
          promise.resolve([true, result]);
        } else {
          promise.resolve([false, result]);
        }
      }, function(error: any) {
        // console.log(error);
        promise.resolve([false, error]);
      });
      break;

      case 'get':
      // console.log('Fetch: ', queryParams.objectId);
      query.get(queryParams.objectId).then(function(result: any) {
        // console.log(JSON.parse(JSON.stringify(result)));
        if (result !== undefined) {
          promise.resolve([true, result]);
        } else {
          promise.resolve([false, result]);
        }
      }, function(error: any) {
        // console.log(error);
        promise.resolve([false, error]);
      });
      break;
    }
    return promise;
  }

  public saveObject(objectInput: any) {
    let promise = new Parse.Promise();
    // console.log('Type: ', objectInput.type);
    switch (objectInput.type) {
      case 'Object':
      let object: any;
      // console.log('Option: ', objectInput.option);
      if (objectInput.option == 'new') {
        let Object = Parse.Object.extend(objectInput.className);
        object = new Object();
      } else if (objectInput.option == 'edit') {
        object = objectInput.object;
      }
      // console.log('Object to save: ', objectInput.object);
      for (let key in objectInput.data) {
        object.set(key, objectInput.data[key]);
        // console.log('Save: ' + key + ' => ' + objectInput.data[key]);
      }
      object.save().then(function(objectSaved: any) {
        // The file has been saved to Parse.
        // console.log('Object saved or created');
        promise.resolve([true, objectSaved]);
      }, function(error: any) {
        // The file could not be saved or created.
        // console.log(error);
        promise.resolve([false, error]);
      });
      break;

      case 'File':
      let file: any;
      if ('base64' in objectInput) {
        file = new Parse.File(objectInput.fileName, { base64: objectInput.base64 });
      } else if ('bytes' in objectInput) {
        file = new Parse.File(objectInput.fileName, objectInput.bytes);
      } else if ('fileData' in objectInput && 'contentType' in objectInput) {
        file = new Parse.File(objectInput.fileName, objectInput.fileData, objectInput.contentType);
      }
      file.save().then(function(fileSaved: any) {
        // The file has been saved to Parse.
        // console.log('File saved');
        promise.resolve([true, fileSaved]);
      }, function(error: any) {
        // The file could not be saved or created.
        // console.log(error);
        promise.resolve([false, error]);
      });
      break;

      case 'User':
      let user = new Parse.User();

      for (let key in objectInput.data) {
        user.set(key, objectInput.data[key]);
        // console.log('Save: ' + key + ' => ' + objectInput.data[key]);
      }

      let sessionToken = this.isLoggedIn().getSessionToken();
      // console.log('Session Token:', sessionToken);

      user.signUp(null, {
        success: function(userCreated: any) {
          // Hooray! Let them use the app now.
          // console.log("User created:", JSON.parse(JSON.stringify(userCreated)));
          Parse.User.logOut().then(function(result: any) {
            // console.log("Logout successfull:", result);
            Parse.User.become(sessionToken).then(function(currentUser: any) {
              // Continue doing what you want
              // console.log("Become:", JSON.parse(JSON.stringify(currentUser)));
              promise.resolve([true, userCreated]);
            }, function(error: any) {
              // The token could not be validated.
              // console.log(error);
              promise.resolve([false, error]);
            });
          }, function(error: any) {
            // console.log(error);
            promise.resolve([false, error]);
          });
        },
        error: function(user: any, error: any) {
          // Show the error message somewhere and let the user try again.
          // console.log(error);
          promise.resolve([false, error]);
        }
      });
      break;
    }
    return promise;
  }

  public cloudFunction(params: any) {
    // console.log('Cloud function');
    let promise = new Parse.Promise();
    Parse.Cloud.run(params.functionName, params.data).then(function(response: any) {
      // console.log(result);
      promise.resolve([true, response]);
    }, function(error: any) {
      // console.log(error);
      promise.resolve([false, error]);
    });
    return promise;
  }

}
