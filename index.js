"use strict";

let http = require('http');

const HOCKEYDB_URL = 'http://www.hockeydb.com/ihdb/stats/pdisplay.php?pid='
let generateHDBUrl = id => HOCKEYDB_URL+id;

// SEARCHING CONSTANTS
const PLAYER_NAME_ELEMENT_TAG = '<h1 itemprop="name" class="title">';
const PLAYER_NAME_ELEMENT_CLOSE = '</h1>';
const PLAYER_INFO_BOX_TAG = '<div class="v1-1">';
const BREAK_LINE = '<br />';

const EMDASH = '--';
const EMDASH_SHOOTS = '-- shoots'; // THIS IS A BAD IDEA
const BORN = 'Born';
const HEIGHT = 'Height';
const WEIGHT = 'Weight';


const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Brett']


module.exports = exports = function(id, callback) // callback(err, playerInfo: Object)
{
    httpGet(generateHDBUrl(id), (err, response, body) => {
        let playerInfo = {};

        let nameStartIndex = body.indexOf(PLAYER_NAME_ELEMENT_TAG) + PLAYER_NAME_ELEMENT_TAG.length;
        let nameEndIndex = body.indexOf(PLAYER_NAME_ELEMENT_CLOSE, nameStartIndex);

        playerInfo.name = body.substring(nameStartIndex, nameEndIndex).trim();

        let playerInfoBoxStartIndex = body.indexOf(PLAYER_INFO_BOX_TAG, nameStartIndex) + PLAYER_INFO_BOX_TAG.length;
        // the player info comes after the name, always. May as well speed it up if we can;

        // Position is between the start tag and the --
        let emdashIndex = body.indexOf(EMDASH_SHOOTS, playerInfoBoxStartIndex);
        playerInfo.position = body.substring(playerInfoBoxStartIndex, emdashIndex).trim();

        emdashIndex += EMDASH_SHOOTS.length;
        let breakLineAfterHandednessIndex = body.indexOf(BREAK_LINE, emdashIndex);
        playerInfo.handedness = body.substring(emdashIndex, breakLineAfterHandednessIndex).trim();

        let bornIndex = body.indexOf(BORN, breakLineAfterHandednessIndex) + BORN.length;
        emdashIndex = body.indexOf(EMDASH, bornIndex);
        let birthdate = body.substring(bornIndex, emdashIndex).trim().split(/\s/g);
        playerInfo.birthdate = new Date(parseInt(birthdate[2]), monthStringToInt(birthdate[0])-1, parseInt(birthdate[1]));

        let heightIndex = body.indexOf(HEIGHT, emdashIndex) + HEIGHT.length;
        emdashIndex = body.indexOf(EMDASH, heightIndex);
        playerInfo.height = heightStringToInches(body.substring(heightIndex, emdashIndex).trim());

        let weightIndex = body.indexOf(WEIGHT, emdashIndex) + WEIGHT.length;
        emdashIndex = body.indexOf(EMDASH, weightIndex);
        playerInfo.weight = parseInt(body.substring(weightIndex, emdashIndex));

        callback(null, playerInfo);
    })
}

function httpGet(url, cb)
{
    let body = '';
    http.get(url, (response) => {
        response.on('data', (data) => {
            body += data;
        }).on('end', () => {
            cb(null, response, body);
        });
    }).on('error', cb);
}

function monthStringToInt(month)
{
    for(let m = 0; m < MONTHS.length; m++)
    {
        if(MONTHS[m].toLowerCase().startsWith(month.toLowerCase()))
            return m+1;
    }

    return -1;
}

function heightStringToInches(s)
{
    let heightInfo = s.split('.');
    return parseInt(heightInfo[0])*12 + parseInt(heightInfo[1]);
}
