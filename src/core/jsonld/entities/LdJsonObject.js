/**
 * Created by michbil on 13.09.16.
 */

import sortByOrder from 'lodash.sortbyorder';
import Mention, {MappedMention,MappedCoverMention} from '../mentions/mention';
import Image from '../mentions/image';
import _ from 'lodash';

var Article, ItemList, ImageObject;

export default class LdJsonObject {

    // factory method to genereate new mention objects
    static MentionFactory(m) {
        switch (m["@type"]) {
            case "ImageObject":
                return new Image(m) ;
            default:
                return new Mention(m);
        }
    }
    // factroy method to generate new LdJson objects according to its contents
    static LdJsonFactory(json,order,root) {

        Article = Article || require('./Article.js').default;
        ItemList = ItemList || require('./ItemList.js').default;
        ImageObject = ImageObject || require('./ImageObject.js').default;


        var type = json['@type'];
        if (type) {
            switch (type) {
                case 'Article':
                    return new Article(json,order,root);
                case 'ItemList':
                    return new ItemList(json,order,root);
                case "ImageObject":
                    return new ImageObject(json,order,root);
                default:
                    //console.warn("LdJsonFactory using default object for",type);
                    return new LdJsonObject(json,order,root);

            }
        }
    }


    sortMentions(mentions) {
        return sortByOrder(mentions, [function (m) {
            var mention = LdJsonObject.MentionFactory(m);
            return mention.order;
        }, function (m) {
            var mention = LdJsonObject.MentionFactory(m);
            return mention.start;
        }, function (m) {
            return m["@type"];
        }], ['asc', 'asc', 'desc']);
    }

    constructor(json,order,root) {
        this.data = json;
        this.children = [];
        this.mentions = json.mentions;
        if (root) {
            this.mentions = this.mentions || root.mentions;
            this.root = root;
        } else {
            this.root = this;
        }
        this.mappedMent = {}; // mapped mentions will be placed here
        this.mentionCursor = {}; // mapped mentions will be placed here

        this.processJsonLDmentions(json, order);

        if (json.hasPart) { // process mentions for all the parts
            var order = json.articleBody.length + 2;
            json.hasPart.forEach((part, i) => {
                if (i > 0) {
                    order += json.hasPart[i-1].articleBody ? json.hasPart[i-1].articleBody.length + 1 : 1;
                }
                this.addChild(part,order);
            });
        }

    }

    addChild(part,order) {
        let element = LdJsonObject.LdJsonFactory(part,order,this.root);
        this.children.push(element);
    }


    /* function reads JSON+LD mentions and attaches them to the JSONLD */
    processJsonLDmentions (json, order) {

        // let handle image injection into the article
        const images = json.image || this.root.data.image;
        if (json.image && typeof json.image === "object") {
            images.forEach((i) => {
                this.mentions.push(i);
            });
        }

        let mentions = this.mentions;

        if (mentions) {
            mentions = this.sortMentions(mentions);
            mentions.forEach(function(m) {
                var mention = LdJsonObject.MentionFactory(m);
                if (mention.order > (order || 0)) {
                    this.attachMentionToElement(mention, order);
                }
            }, this);
        }
    };

    hasPart() {
        return this.data.hasPart;
    }

    getType() {
        return this.data['@type'];
    }

    getMentions() {
        return this.data.mentions;
    }

    hasElementOfType(type) {
        return this.data['@type'] === type || _.chain(this.data.itemListElement)
                .pluck('@type')
                .contains(type)
                .value();
    }

    /* dummy function to create mention entries

     if pos is specified saves value as array entry  this.mappedMent[key][arrayPos]
     or this.mappedMent[key]

     */
    _touchMentionKey(key,value,mention,arrayPos,mentionType) {

        mentionType = mentionType || MappedMention;

        if (mention instanceof Image) {
            if (arrayPos !== undefined) {
                this.mappedMent[key] = this.mappedMent[key] || [];
                this.mappedMent[key][arrayPos] = this.mappedMent[key][arrayPos]||  mention;
            } else {
                this.mappedMent[key] = this.mappedMent[key] || mention;
            }

            return;
        }

        if (arrayPos !== undefined) {
            this.mappedMent[key] = this.mappedMent[key] || [];
            this.mappedMent[key][arrayPos] = this.mappedMent[key][arrayPos] || new mentionType(value);
            this.mappedMent[key][arrayPos].applyMention(mention);
        } else {
            this.mappedMent[key] = this.mappedMent[key] || new mentionType(value);
            this.mappedMent[key].applyMention(mention);
        }
    }




    attachMentionToElement  (mention, order) {
        let json = this.data;
        order = order || 0;

        for (let key of Object.keys(json)) {
            if (['name', 'about'].indexOf(key) !== -1) {
                order ++;
                if (mention.order === order) {
                    this._touchMentionKey(key,json[key],mention);
                    return true;
                }
            } else if (key === 'articleBody') { // to process articles
                let articleBody = json[key];
                if (order + articleBody.length >= mention.order) {
                    let pos = mention.order - order - 1;
                    this._touchMentionKey(key,articleBody[pos],mention,pos);
                    return true;
                }
            } else if (key=='text') {  // to process covers
                var text = json[key],
                    pos;
                if (order + text.length >= mention.order) {
                    pos = mention.order - order - 1;
                    this._touchMentionKey(key, text[pos], mention, pos, MappedCoverMention);
                    return true;
                }
            }
        }
        return false;
    };

    getKey(block) {
        if (this.mappedMent[block]) {
            let mention = this.mappedMent[block];
            if (!mention) {
                console.error("Unable to get mapped mention",block);
            }
            return mention.render();
        } else {
            return this.data[block];
        }
    }

    render() {

    }

    childMentionCount() {
        let count = 0;
        for (let child in this.children) {
            count += child.mentions.length();
        }
        return count;
    }

}