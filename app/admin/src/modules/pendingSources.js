import axios from 'axios';
import { updateCrudStatus, crudStatus, httpThunk } from '../utils';

export const FETCH_PENDING_SOURCES = 'pendingSources/FETCH_PENDING_SOURCES';
export const ADD_PENDING_SOURCES = 'pendingSources/ADD_PENDING_SOURCES';
export const UPDATE_PENDING_SOURCE = 'pendingSources/UPDATE_PENDING_SOURCE';
export const DELETE_PENDING_SOURCES = 'pendingSources/DELETE_PENDING_SOURCES';
export const VOTE_PENDING_SOURCE = 'pendingSources/VOTE_PENDING_SOURCE';
export const FETCH_PENDING_SOURCE_VOTES = 'pendingSources/FETCH_PENDING_SOURCE_VOTES';

const initialState = {
  pendingSources: [],
  pendingSourceVotes: [],
  totalCount: 0,
  fetchStatus: crudStatus,
  fetchVotesStatus: crudStatus,
  addStatus: crudStatus,
  updateStatus: crudStatus,
  deleteStatus: crudStatus,
  voteStatus: crudStatus,
};

const pendingSourcesReducer = (action, state) => (action.votingStatus !== 'ended'
  ? state.pendingSources.map((pendingSource) => {
    const {
      vote,
      credibleVotesCount,
      notCredibleVotesCount,
    } = pendingSource;
    const hasVotedCredible = vote && credibleVotesCount;
    const hasVotedNotCredible = vote && notCredibleVotesCount;

    if (pendingSource.id === action.pendingSourceId) {
      if (action.votingStatus === 'changed') {
        if (action.isCredible) {
          return {
            ...pendingSource,
            vote: {
              ...vote,
              comment: action.comment,
              isCredible: true,
            },
            credibleVotesCount: credibleVotesCount + 1,
            notCredibleVotesCount: hasVotedNotCredible
              ? notCredibleVotesCount - 1
              : notCredibleVotesCount,
          };
        }

        return {
          ...pendingSource,
          vote: {
            ...vote,
            comment: action.comment,
            isCredible: false,
          },
          credibleVotesCount: hasVotedCredible
            ? credibleVotesCount - 1
            : credibleVotesCount,
          notCredibleVotesCount: notCredibleVotesCount + 1,
        };
      }

      if (action.votingStatus === 'removed') {
        if (action.isCredible) {
          return {
            ...pendingSource,
            vote: null,
            credibleVotesCount: hasVotedCredible
              ? credibleVotesCount - 1
              : credibleVotesCount,
          };
        }

        return {
          ...pendingSource,
          vote: null,
          notCredibleVotesCount: hasVotedNotCredible
            ? notCredibleVotesCount - 1
            : notCredibleVotesCount,
        };
      }

      return {
        ...pendingSource,
        credibleVotesCount: action.isCredible
          ? pendingSource.credibleVotesCount + 1
          : pendingSource.credibleVotesCount,
        notCredibleVotesCount: !action.isCredible
          ? pendingSource.notCredibleVotesCount + 1
          : pendingSource.notCredibleVotesCount,
      };
    }
    return pendingSource;
  })
  : state.pendingSources
    .filter((pendingSource) => pendingSource.id !== action.pendingSourceId));

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PENDING_SOURCES:
      return {
        ...state,
        pendingSources: action.pendingSources || state.pendingSources,
        fetchStatus: updateCrudStatus(action),
        totalCount: action.totalCount || state.totalCount,
      };
    case FETCH_PENDING_SOURCE_VOTES:
      return {
        ...state,
        pendingSourceVotes: action.pendingSourceVotes || state.pendingSourceVotes,
        fetchVotesStatus: updateCrudStatus(action),
      };
    case ADD_PENDING_SOURCES:
      return {
        ...state,
        pendingSources: action.statusText === 'success' ? [
          action.newPendingSource,
          ...state.pendingSources,
        ] : state.pendingSources,
        totalCount: action.statusText === 'success'
          ? state.totalCount + 1
          : state.totalCount,
        addStatus: updateCrudStatus(action),
      };
    case UPDATE_PENDING_SOURCE:
      return {
        ...state,
        pendingSources: state.pendingSources.map((source) => {
          if (source.id === action.sourceId) {
            return action.updateSource;
          }
          return source;
        }),
        updateStatus: updateCrudStatus(action),
      };
    case DELETE_PENDING_SOURCES:
      return {
        ...state,
        pendingSources: action.statusText === 'success'
          ? state.pendingSources.filter((source) => !action.deletedIds.includes(source.id))
          : state.pendingSources,
        totalCount: action.statusText === 'success'
          ? state.totalCount - action.deletedIds.length
          : state.totalCount,
        updateStatus: updateCrudStatus(action),
      };
    case VOTE_PENDING_SOURCE:
      return {
        ...state,
        pendingSources: action.statusText === 'success'
          ? pendingSourcesReducer(action, state)
          : state.pendingSources,
        // action.statusText === 'success'
        //   ? state.pendingSources.filter((source) => action.id !== source.id)
        //   : state.pendingSources,
        voteStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchPendingSources = (page, limit, filter, search) =>
  httpThunk(FETCH_PENDING_SOURCES, async () => {
    try {
      const { data: pendingSources, status, headers } = await axios.get('/pendingSources', {
        params: {
          page,
          limit,
          filter,
          search,
        },
      });

      return {
        totalCount: parseInt(headers['x-total-count'], 10),
        pendingSources,
        status,
      };
    } catch (e) {
      return e;
    }
  });


export const addPendingSources = () => httpThunk(ADD_PENDING_SOURCES, async (getState) => {
  const { form } = getState();

  try {
    const { data: newPendingSource, status } = await axios.post('/pendingSources', {
      ...form.pendingSources.values,
    });

    return {
      newPendingSource,
      status,
    };
  } catch (e) {
    return e;
  }
});

export const updatePendingSource = (sourceId, source, isIdChanged = false) => async (dispatch) => {
  dispatch({ type: UPDATE_PENDING_SOURCE, statusText: 'pending' });

  try {
    const endpoint = `/pendingSources/${sourceId}`;
    const path = isIdChanged ? `${endpoint}?isIdChanged=true` : endpoint;
    const updatedSource = await axios.put(path, source);

    dispatch({
      type: UPDATE_PENDING_SOURCE,
      statusText: 'success',
      updatedSource,
    });
  } catch (e) {
    dispatch({
      type: UPDATE_PENDING_SOURCE,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMessage: e.response.data.message,
    });
  }
};

export const deletePendingSources = (ids) => httpThunk(DELETE_PENDING_SOURCES, async () => {
  try {
    const { status } = await axios.delete('/pendingSources', {
      data: {
        ids: ids.join(),
      },
    });

    return {
      deletedIds: ids,
      status,
    };
  } catch (e) {
    return e;
  }
});

export const votePendingSource = (sourceId, isCredible, comment) =>
  httpThunk(VOTE_PENDING_SOURCE, async () => {
    try {
      const {
        data: { votingStatus },
        status,
      } = await axios.put(`/pendingSources/${sourceId}/vote`, {
        isCredible,
        comment,
      });

      return {
        pendingSourceId: sourceId,
        votingStatus,
        status,
        isCredible,
        comment,
      };
    } catch (e) {
      return e;
    }
  });

export const fetchPendingSourceVotes = (sourceId, isPending, isCredible) =>
  httpThunk(FETCH_PENDING_SOURCE_VOTES, async () => {
    try {
      const { data: votes, status } = await axios.get(`/pendingSources/${sourceId}/votes`, {
        params: {
          isCredible: isCredible ? 'yes' : 'no',
          isPending: isPending ? 'yes' : 'no',
        },
      });

      return {
        pendingSourceVotes: votes,
        status,
        isCredible,
      };
    } catch (e) {
      return e;
    }
  });
