<template>
  <a-layout>
    <a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%' }">
      <a-row>
        <a-col :span="6">
          <Logo/>
        </a-col>
        <a-col :span="12">
          <div id="searchBox">
            <a-input-search
              v-if="searchMode"
              size="large"
              allowClear
              v-model="searchVal"
              ref="searchInput"
              style="width: 100%"
              @change="handleSearchValChange"
              @search="handleSearch"
            >
            </a-input-search>
            <a-select
              v-if="!searchMode"
              size="large"
              mode="tags"
              style="width: 100%"
              allowClear
              ref="topicsInput"
              label-in-value
              :value="selectedTopics"
              :loading="loading"
              placeholder="Select topic..."
              @change="handleTopicChange"
              @search="handleTopicSearch"
              :token-separators="[',']"
            >
              <a-spin v-if="loading" slot="notFoundContent" size="small"/>
              <a-icon slot="clearIcon" type="close"></a-icon>
              <a-select-option v-for="item in topics" :key="item" :value="item">
                {{ item }}
              </a-select-option>
            </a-select>
          </div>
        </a-col>
        <a-col :span="6">
          <UserMenu/>
        </a-col>
      </a-row>
    </a-layout-header>
    <a-layout-content :style="{ marginTop: '64px' }">
      <template v-if="hasTitle">
        <div class="pageHeader">
          <a-breadcrumb v-if="auth && collectionToken != ''">
            <a-breadcrumb-item><NuxtLink to="/pages/collections">Collections</NuxtLink> /</a-breadcrumb-item>
          </a-breadcrumb>
          <h1>{{header}}</h1>
          <div v-html="filterInfo"></div>
        </div>
      </template>
      <div style="background-color: #ececec; padding: 20px;">
        <a-alert v-if="this.error !=''"
                 message="Whoops"
                 type="error"
                 show-icon
        >
          <p slot="description" v-html="this.error"></p>
        </a-alert>
        <template v-if="!this.loading && this.data.length == 0 && col.id > 0">
          <a-empty>
            <span slot="description"> No data in this collection</span>
          </a-empty>
        </template>
        <template
          v-if="showYouGotNothing">
          <a-row :gutter="16">
            <a-col :lg="24" :xl="12">
              <a-card>
                <div slot="title">You've just got nothing <!--(at least you have internet)--></div>
                <a-avatar shape="square"
                          src="https://lovingthepregnantyou.com/wp-content/uploads/2012/06/itsOK_go_on.jpg"
                          id="notContentPic"/>
                <p>If you get here from external link it is means that content that was here is not longer available,
                  sorry.</p>
                <p>You might clarify your search in the search box above.</p>
                <p>If you search this by your own intent, then you got what you looked for.</p>
              </a-card>
            </a-col>
            <a-col :lg="24" :xl="12">
              <a-card>
                <div slot="title">Care to contribute?</div>
                <a-avatar shape="square" src="https://media.tenor.com/images/a5369af4f7b18dae48f9204242e29664/tenor.gif"
                          id="contributePic"/>
                <p>If you think that something is missing here or not correct - you could <a
                  href="https://github.com/refto/data#how-to-contribute" target="_blank">resolve this issue by
                  yourself</a>.</p>
                <p>To busy to contribute? Simply <a href="https://github.com/refto/data/issues/new" target="_blank">open
                  an issue</a> about what you missed here, we'll take care of it.</p>
                <p>Thank you!</p>
              </a-card>
            </a-col>
          </a-row>
        </template>
        <a-row :gutter="16" type="flex" align="top" v-masonry transition-duration="1s" item-selector=".masonryCard">
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="8" v-masonry-tile class="masonryCard" v-if="showWelcomeText">
            <a-card id="intro">
              <p><b>Welcome to refto.dev</b> - a collection of awesome creations that is useful to software developers.
                The <a href="https://github.com/refto/data" target="_blank">data source is stored on GitHub</a> and
                anyone is welcome to contribute.
              </p>
              <ul>
                <li>
                  <a-icon type="github"/>
                  <a href="https://github.com/refto/data" target="_blank">Data source</a></li>
                <li>
                  <a-icon type="github"/>
                  <a href="https://github.com/refto/frontend" target="_blank">Frontend source</a></li>
                <li>
                  <a-icon type="github"/>
                  <a href="https://github.com/refto/server" target="_blank">Server source</a></li>
              </ul>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="8" v-masonry-tile v-for="d in data" :key="d.token"
                 class="masonryCard">
            <a-card :class="getCardClass(d)">
              <span slot="title">
                <a v-if="d.type != 'definition-rel'" @click="setEntityID(d.id)">
                  <a-icon :type="getIcon(d)"/> {{d.data.title}}
                </a>
                <span v-else> <a-icon :type="getIcon(d)"/> {{d.data.title}}</span>
              </span>

              <a slot="extra" v-if="d.data.home_addr != null" :href="d.data.home_addr"
                 :title="'Link to ' + d.data.title" target="_blank">
                <a-icon type="link"/>
              </a>
              <div v-if="d.data.topics != null && topicsDiff(d.data.topics).length > 0" slot="actions">
                <a-button v-for="(t, i) in topicsDiff(d.data.topics)" @click="addTopic(t)" :key="i"
                          class="add-topic-btn" :type="getTopicButtonType(t)" :title="'Filter by ' + t">
                  +{{t}}
                </a-button>
              </div>
              <component v-bind:is="components[d.type]" :data="d.data"></component>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="8" v-masonry-tile class="masonryCard" v-if="showNotSatisfiedText">
            <a-card id="outro">
              <div slot="title">
                <a-icon type="thunderbolt"/>
                Not satisfied?
              </div>
              <a-avatar shape="square"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfULlhWZCclULsqfSiaUl5uwYNefsF45MEMesbKVZN6_5dQLxjuQ&s"/>
              <p>If you'll find that is something missing here or not correct - feel free to <a
                href="https://github.com/refto/data#how-to-contribute" target="_blank">fix it by yourself</a>.</p>
              <p>To busy to contribute? Simply <a href="https://github.com/refto/data/issues/new" target="_blank">open
                an issue</a> about what need to be fixed, we'll take care of it.</p>

              <p>Thank you!</p>
            </a-card>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <div v-if="this.data.length < totalCount" style="text-align: center">
              <a-button @click="loadMore()" type="primary" size="large" :loading="this.loading" shape="round"> Load
                ant-card-extra...
              </a-button>
            </div>
          </a-col>
        </a-row>
      </div>

    </a-layout-content>
    <Footer/>
    <a-modal v-model="helpVisible" title="A little bit of help" :footer="null">
      <div id="intro-help">
        <p>To enter "search mode" start your search query with special character:</p>
        <ul>
          <li>Start search query with <code>@</code> to search in reference URLs. For example,
            <code>@github.com</code> will return all data that references to <code>github.com</code>. Try now: <a
              href="https://refto.dev/@github.com">refto.dev/@github.com</a></li>
          <li>Start search query with <code>~</code> to search in names. For example, <code>~elastic</code> will
            return all data that have <code>elastic</code> in their names. Try now: <a
              href="https://refto.dev/~elastic">refto.dev/~elastic</a></li>
          <li>Start search query with <code>*</code> to search in everywhere. For example, <code>*server</code>
            will return all data that contains <code>server</code>. Try now: <a href="https://refto.dev/*server">refto.dev/*server</a>
          </li>
        </ul>
        <p>To return back to "topics mode" simply clear search query</p>
      </div>
    </a-modal>
    <EntityModal :entity_id="entityID" v-on:setEntityID="setEntityID($event)"/>
  </a-layout>
</template>
<script>
    import GenericType from "../components/data-types/Generic";
    import BookType from "../components/data-types/Book";
    import PersonType from "../components/data-types/Person";
    import ConferenceType from "../components/data-types/Conference";
    import SoftwareType from "../components/data-types/Software";
    import DefinitionType from "../components/data-types/Definition";
    import DefinitionRelType from "../components/data-types/DefinitionRel";
    import UserMenu from "../components/UserMenu";
    import Footer from "../components/Footer";
    import Logo from "../components/Logo";
    import EntityModal from "../components/entities/View";
    import Vue from 'vue'


    // input starting with any of this chars
    // disables topics mode and triggers free search mode
    const addrFilterPrefix = "@" // search in addresses
    const nameFilterPrefix = "~" // search in names
    const searchModePrefix = "*" // search everywhere
    const searchTriggers = [addrFilterPrefix, nameFilterPrefix, searchModePrefix]

    const collectionInputPrefix = "c:"
    const entityInputPrefix = "e:"

    const helpTrigger = "?"

    export default {
        data() {
            return {
                data: [],
                topics: [],
                selectedTopics: [],
                loading: false,
                totalCount: 0,
                page: 1,
                components: {
                    '': GenericType,
                    'generic': GenericType,
                    'book': BookType,
                    'person': PersonType,
                    'conference': ConferenceType,
                    'software': SoftwareType,
                    'definition': DefinitionType,
                    'definition-rel': DefinitionRelType,
                },
                error: "",
                searchMode: false,
                searchVal: "",
                helpVisible: false,
                auth: null,
                collectionToken: "",
                col: {
                    id: 0
                },
                entityID: "",
                header: "",
                filterInfo: "",
            };
        },

        components: {
            GenericType,
            BookType,
            PersonType,
            ConferenceType,
            SoftwareType,
            DefinitionType,
            DefinitionRelType,
            UserMenu,
            Footer,
            Logo,
            EntityModal,
        },

        beforeMount() {
            if (this.$store.state.auth !== null) {
                this.auth = this.$store.state.auth
            }

            this.init()
        },

        mounted() {
            if (this.entityID !== "") {
                let a = this.entityID
                this.entityID = 0
                this.setEntityID(a)
            }
        },

        methods: {
            init() {
                this.handleInputFromPath()
                if (this.collectionToken != "") {
                    this.loadDataWithCollection()
                } else {
                    this.loadData()
                }
            },

            async loadData() {
                this.header = ""
                this.error = ""
                this.loading = true
                // todo: there must be a better way to searialize array into query string
                let path = '/entities/'
                let qs = []
                if (this.selectedTopics.length > 0) {
                    for (let i = 0; i < this.selectedTopics.length; i++) {
                        qs.push("topics=" + encodeURIComponent(this.selectedTopics[i].key));
                    }
                }
                qs.push("page=" + this.page)

                if (this.searchVal != "") {
                    let sv = this.searchVal
                    let param = ""

                    if (sv.startsWith(addrFilterPrefix)) {
                        param = "addr"
                    }
                    if (sv.startsWith(nameFilterPrefix)) {
                        param = "name"
                    }
                    if (sv.startsWith(searchModePrefix)) {
                        param = "query"
                    }

                    if (param != "") {
                        qs.push(param + "=" + encodeURIComponent(sv.substr(1)))
                    }
                }

                if (this.col.id > 0) {
                    qs.push("col=" + this.col.id)
                }

                if (qs.length > 0) {
                    path += "?" + qs.join("&")
                }

                try {
                    await this.$axios.$get(path).then((resp) => {
                        if (resp.entities == null) {
                            resp.entities = []
                        }
                        if (resp.topics == null) {
                            resp.topics = []
                        }

                        if (this.page === 1) {
                            this.data = resp.entities
                        } else {
                            this.data = this.data.concat(resp.entities)
                        }

                        this.topics = resp.topics
                        this.totalCount = resp.entities_count

                        if (resp.definition != null) {
                            let defElems = [resp.definition]
                            let rels = resp.definition.data.relations
                            if (rels != null) {
                                for (let i = 0; i < rels.length; i++) {
                                    let defChild = {
                                        title: rels[i].title,
                                        token: resp.definition.token + "- " + i,
                                        type: "definition-rel",
                                        data: rels[i]
                                    }
                                    defElems.push(defChild)
                                }
                            }
                            Array.prototype.unshift.apply(this.data, defElems);
                        }

                        this.getFilterInfo()
                    })
                } catch (e) {}
                this.loading = false
            },

            loadDataWithCollection() {
                this.loading = true

                this.$axios.$get('/collections/' + this.collectionToken + '/').then((resp) => {
                    this.col = resp
                }).
                then(() => {
                    this.loadData()
                })

                this.loading = false
            },

            handleTopicChange(val) {
                if (val.length > 0 && val[val.length - 1].label == helpTrigger) {
                    this.selectedTopics = val.slice(0, -1)
                    return
                }

                this.page = 1

                if (val.length > 0 && this.isSearchTrigger(val[0].label)) {
                    this.selectedTopics = []
                    return
                }


                let sTopics = []
                for (let i = 0; i < this.selectedTopics.length; i++) {
                    sTopics.push(this.selectedTopics[i].key)
                }

                this.topics = []
                this.selectedTopics = val;
                this.setPathFromSelectedTopics()
                this.loadData()
                window.scrollTo(0, 0);
            },

            handleSearch(val, e) {
                this.page = 1
                this.loadData()
            },

            setEntityID(id) {
                this.entityID = id
            },

            handleTopicSearch(val) {
                if (val == helpTrigger) {
                    this.helpVisible = true
                    return
                }
                if (this.isSearchTrigger(val)) {
                    this.searchVal = val
                    this.searchMode = true
                    this.selectedTopics = []

                    setTimeout(() => {
                        this.$refs.searchInput.$el.children[0].focus()
                    })
                }
            },

            handleSearchValChange(e) {
                if (!this.isSearchTrigger(this.searchVal)) {
                    const val = this.searchVal
                    this.searchVal = ""
                    let selectedTopics = []
                    if (val != "") {
                        selectedTopics.push({key: val, label: val})
                    }
                    this.handleTopicChange(selectedTopics)
                }
            },

            topicsDiff(topics) {
                if (topics == undefined) {
                    return
                }
                let sTopics = []
                for (let i = 0; i < this.selectedTopics.length; i++) {
                    sTopics.push(this.selectedTopics[i].key)
                }
                return topics.filter(x => !sTopics.includes(x));
            },

            addTopic(t) {
                this.page = 1
                this.selectedTopics.push({key: t, label: t})
                this.setPathFromSelectedTopics()
                this.searchVal = ""
                this.loadData()
                window.scrollTo(0, 0);
            },

            handleInputFromPath() {
                this.resolveInputFromHash(this.$route.hash)

                let pathVal = this.$route.params.pathMatch
                if (pathVal === "") {
                    return
                }

                if (this.isSearchTrigger(pathVal)) {
                    this.searchVal = pathVal
                    return
                }

                const topics = pathVal.split(',');
                for (let i = 0; i < topics.length; i++) {
                    this.selectedTopics.push({key: topics[i], label: topics[i]})
                }
            },

            resolveInputFromHash(hash) {
                if (hash == "") {
                    return
                }

                let collectionToken = ""
                let entityID = ""
                let hashParts = hash.split('#');

                for (let i = 0; i < hashParts.length; i++) {
                    if (hashParts[i] === "") {
                        continue
                    }
                    if (collectionToken === "") {
                        collectionToken = this.resolveCollectionFromPath(hashParts[i])
                    }
                    if (entityID === "") {
                        entityID = this.resolveEntityFromPath(hashParts[i])
                    }
                }

                this.collectionToken = collectionToken
                this.entityID = entityID
            },

            resolveCollectionFromPath(v) {
                if (v.startsWith(collectionInputPrefix)) {
                    return v.slice(collectionInputPrefix.length)
                }

                return ""
            },


            resolveEntityFromPath(v) {
                if (v.startsWith(entityInputPrefix)) {
                    return v.slice(entityInputPrefix.length)
                }

                return ""
            },

            setPathFromSelectedTopics() {
                let sTopics = []
                for (let i = 0; i < this.selectedTopics.length; i++) {
                    sTopics.push(encodeURIComponent(this.selectedTopics[i].key))
                }

                history.pushState(
                    {},
                    null,
                    "/" + sTopics.join(',') + location.hash
                )
            },

            getIcon(d) {
                if (d.data.icon != null) {
                    return d.data.icon
                }
                if (d.type === 'person') {
                    return 'star'
                }
                if (d.type === 'conference') {
                    return 'team'
                }
                if (d.type === 'software') {
                    return 'appstore'
                }
                if (d.type === 'book') {
                    return 'book'
                }

                if (d.data.home_addr != null) {
                    if (d.data.home_addr.startsWith('https://github.com')) {
                        return 'github'
                    }

                    return "link"
                }

                return "info-circle"
            },

            getTopicButtonType(val) {
                if (val.startsWith('source:')) {
                    return 'dashed'
                }

                return ''
            },

            loadMore() {
                this.page++
                this.loadData()
            },

            isSearchTrigger(val) {
                if (val.length > 1) {
                    val = val.charAt(0)
                }
                return searchTriggers.includes(val);
            },

            getCardClass(d) {
                // make definitions stand out a bit
                if (d.type === 'definition') {
                    return 'definition-card'
                }
                if (d.type === 'definition-rel') {
                    return 'definition-rel-card'
                }

                return ''
            },

            logout() {
                this.$store.commit('setAuth', null)
                this.auth = null
            },

            getFilterInfo: function () {
                if (!this.searchMode && this.col.id == 0) {
                    return
                }

                let sv = this.searchVal
                let head = ""
                let info = ""

                if (this.searchMode && sv.length > 1) {
                    head = "Search "
                    if (sv.startsWith(addrFilterPrefix)) {
                        head += "in ref. URLs"
                    }
                    else if (sv.startsWith(nameFilterPrefix)) {
                        head += "in names"
                    }

                    this.header = head

                    if (this.col.id > 0) {
                        info = "Collection: " + this.col.name + "<br>"
                    }

                    info += "Found "
                    if (this.totalCount > 0) {
                        info += "elements: " + this.totalCount
                    } else {
                        info += "nothing."
                    }

                    this.filterInfo = info
                    return
                }

                if (this.col.id > 0) {
                    this.header = this.col.name
                }
            }

        },

        watch: {
            searchVal: function (val) {
                this.searchMode = val != ""

                if (this.searchMode) {
                    history.replaceState(
                        {},
                        null,
                        "/" + val.charAt(0) + encodeURIComponent(val.substr(1))  + location.hash
                    )
                }
            },
            $route: function() {
                console.log("route changed")
                this.init()
            },
        },

        computed: {
            showWelcomeText: function () {
                return this.col.id == 0 && this.selectedTopics.length < 1 && this.searchVal == '' && this.data.length !== 0
            },
            showNotSatisfiedText: function () {
                return this.col.id == 0 && this.data.length >= this.totalCount && !this.loading && this.data.length != 0
            },
            showYouGotNothing: function () {
                return !this.loading && this.col.id == 0 && this.data.length == 0 && (this.selectedTopics.length > 0 || this.searchVal != '')
            },
            hasTitle: function () {
                return this.header != ""
            },
        },
    };
</script>

<style>
  .data-links {
    margin: 0 0 7px 0;
    padding: 0;
    display: block;
    text-align: center;
  }

  .data-links li {
    list-style: none;
    display: inline-block;
    margin: 3px 5px;
  }

  .ant-avatar {
    float: right;
    margin-left: 10px;
    margin-bottom: 10px;
    width: 120px;
    height: initial;
  }



  #intro {
    padding: 20px;
    background: #168be5;
    color: #c6d6ff;
    box-shadow: none;
  }

  #intro-help {
    margin-bottom: 20px;
  }

  #intro-help li {
    margin-bottom: 20px;
  }

  #intro-help code {
    display: inline-block;
    background: #e2e8fb;
    padding: 0 7px;
  }

  #intro a {
    color: white;
    text-decoration: underline;
  }

  #intro a:hover {
    color: #02e8ff;
    text-decoration: underline;
  }

  #intro ul {
    margin: 0;
  }

  #intro ul li {
    list-style: none;
    font-size: 16px;
  }

  .add-topic-btn {
    margin: 1px;
    border-radius: 0;
    padding: 0 7px;
  }



  #notContentPic {
    float: left;
    margin-bottom: 10px;
    margin-right: 10px;
    margin-left: 0;
    width: 200px;
    height: initial;
  }


  #contributePic {
    float: right;
    margin-bottom: 10px;
    margin-right: 0px;
    margin-left: 10px;
    width: 200px;
    height: initial;
  }

  .definition-card {
    box-shadow: inset 0 0 0 1px #9aabd1;
  }

  .definition-card .ant-card-head-title {
    font-weight: 400;
  }

  .definition-rel-card .ant-card-head-title {
    font-weight: 400;
  }

  .definition-card:hover {
    box-shadow: inset 0 0 0 2px #168be5, 0 0 8px rgba(0, 0, 0, 0.2);
  }

  .definition-rel-card {
    box-shadow: inset 0 0 0 1px #9aabd1;
  }

  .definition-rel-card:hover {
    box-shadow: inset 0 0 0 2px #168be5, 0 0 8px rgba(0, 0, 0, 0.2);
  }

  .ant-card-extra {
    font-size: 20px;
  }

  .pageHeader {
    padding: 20px;
  }

  h1 {
    font-size: 28px;
    margin: 0;
  }

</style>
