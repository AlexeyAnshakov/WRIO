/**
 * Created by michbil on 06.03.17.
 */

import { getServiceUrl } from 'base/servicelocator';

export const sendCommentRequest = (data, params) =>
  $.ajax({
    url: `${getServiceUrl('pinger')}/sendComment?${params}`,
    type: 'post',
    processData: false, // Не обрабатываем файлы (Don't process the files)
    contentType: false,
    dataType: 'json',
    data,
    xhrFields: {
      withCredentials: true,
    },
  });

export const sendDonateRequest = (data, params) =>
  $.ajax({
    url: `${getServiceUrl('pinger')}/requestDonate?${params}`,
    type: 'post',
    processData: false, // Не обрабатываем файлы (Don't process the files)
    contentType: false,
    dataType: 'json',
    data,
    xhrFields: {
      withCredentials: true,
    },
  });

export const getBalanceRequest = () =>
  $.ajax({
    url: `${getServiceUrl('webgold')}/api/webgold/get_balance`,
    type: 'GET',
    xhrFields: {
      withCredentials: true,
    },
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

export const getAddFundsDataRequest = () =>
  $.ajax({
    url: `${getServiceUrl('webgold')}/add_funds_data`,
    type: 'GET',
    xhrFields: {
      withCredentials: true,
    },
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

export const getEthereumIdRequest = () =>
  $.ajax({
    url: `${getServiceUrl('webgold')}/api/webgold/get_wallet`,
    type: 'GET',
    xhrFields: {
      withCredentials: true,
    },
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

export const getUserEthereumId = wrioID =>
  $.ajax({
    url: `${getServiceUrl('webgold')}/api/webgold/get_user_wallet?wrioID=${wrioID}`,
    type: 'GET',
    xhrFields: {
      withCredentials: true,
    },
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

export const freeWrgRequest = () => {
  const address = web3.eth.defaultAddress;

  $.ajax({
    url: `${getServiceUrl('webgold')}/api/webgold/free_wrg?amount=100&address=${address}`,
    type: 'GET',
    xhrFields: {
      withCredentials: true,
    },
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
}

export const txStatusRequest = hash =>
  $.ajax({
    url: `${getServiceUrl('webgold')}/api/webgold/tx_poll?txhash=${hash}`,
    type: 'GET',
    xhrFields: {
      withCredentials: true,
    },
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
