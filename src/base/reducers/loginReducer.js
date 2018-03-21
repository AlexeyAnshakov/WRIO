import * as actions from "base/actions/actions";
const defaultState = {
  wrioID: null,
  profile: null,
  myList: []
};

function loginReducer(state = defaultState, action) {
  switch (action.type) {
    case actions.LOGIN_MESSAGE:
      var profile = action.msg.profile;
      return {
        ...state,
        wrioID: profile.id,
        profile
      };
      break;
    case actions.MY_LIST_READY:
      return {
        ...state,
        myList: action.myList
      };
      break;
    default:
      return state;
  }
}

export default loginReducer;
