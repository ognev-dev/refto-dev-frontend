<template>
  <a-layout>
    <a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%' }">
      <a-row>
        <a-col :span="12">
          <Logo/>
        </a-col>
        <a-col :span="12">
          <UserMenu/>
        </a-col>
      </a-row>
    </a-layout-header>
    <a-layout-content :style="{ margin: '20px', marginTop: '84px', padding: '24px' }">
      <a-row>
        <a-col :span="18"><h1>My repositories</h1></a-col>
        <a-col :span="6">
          <a-button type="primary" icon="plus" style="float: right" @click="showCreateForm" v-if="this.hasData()">
            Add repository
          </a-button>
        </a-col>
      </a-row>
      <a-row>
        <a-card v-for="(el, i) in this.data">
          <a slot="title">
            {{ getRepoName(el) }}
            <a-tag class="repoCardTitleTag" :color="getTypeColor(el.type)">
              <a-icon :type="getTypeIcon(el.type)"/>
              {{ el.type }}
            </a-tag>
            <a-tag class="repoCardTitleTag" :color="getConfirmedColor(el.confirmed)">
              <a-icon :type="getConfirmedIcon(el.confirmed)"/>
              {{ getConfirmedText(el.confirmed) }}
            </a-tag>
          </a>
          <div slot="extra">
            <a :href="'https://github.com/' +el.path" target="_blank" class="repoCardAddr">
              <a-icon type="github"/>
              {{ el.path }}</a>
            <a-divider type="vertical"/>
            <a @click="showUpdateForm(el)">
              <a-tooltip>
                <template slot="title">Edit</template>
                <a-icon type="edit"/>
              </a-tooltip>
            </a>
            <a-divider type="vertical"/>
            <a-popconfirm
              title="If you request new secret, the current one will no longer be valid"
              ok-text="Proceed"
              placement="leftTop"
              @confirm="handleNewSecret(el)"
            >
            <a>
              <a-tooltip>
                <template slot="title">
                  Request new secret
                </template>
                <a-icon type="safety-certificate"/>
              </a-tooltip>
            </a>
            </a-popconfirm>
            <a-divider type="vertical"/>
            <a-popconfirm
              title="This action cannot be undone and all data related to this repo will deleted for good"
              ok-text="Proceed"
              placement="leftTop"
              @confirm="handleDeleteRepository(el.id)"
            >
              <a>
                <a-tooltip placement="topRight">
                  <template slot="title">
                    If you want your repositories list to be nice and clean - just click here and we'll have our hands
                    dirty by removing this one. And worry not, none of racoons will be harmed in this trashy process
                  </template>
                  <a-icon type="delete"/>
                </a-tooltip>
              </a>
            </a-popconfirm>
          </div>
          <p>{{ el.description }}</p>
          <p class="import-status" v-html="getImportStatus(el)"></p>

        </a-card>
        <template v-if="!this.hasData()">
          <p>You don't have repositories yet</p>
          <a-button type="primary" icon="plus" @click="showCreateForm" size="large">
            Add repository
          </a-button>
        </template>
      </a-row>
    </a-layout-content>
    <Footer/>
    <a-modal v-model="createFormModal">
      <span slot="title"><a-icon type="plus"></a-icon> Add repository</span>
      <CreateForm ref="createForm"/>
      <template slot="footer">
        <a-button key="back" @click="handleCancelCreateRepository">
          Cancel
        </a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleCreateRepository">
          Create
        </a-button>
      </template>
    </a-modal>

    <a-modal v-model="updateFormModal">
      <span slot="title"><a-icon type="edit"></a-icon> Update repository</span>
      <UpdateForm ref="updateForm"/>
      <template slot="footer">
        <a-button key="back" @click="handleCancelUpdateRepository">
          Cancel
        </a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleUpdateRepository">
          Update
        </a-button>
      </template>
    </a-modal>

    <a-modal v-model="newSecretModal" centered okText="OK" :cancelButtonProps="{style: {'display': 'none'}}"
             @ok="newSecretModal=false" :afterClose="handleNewSecretModalClose">
      <span slot="title"><a-icon type="safety-certificate"></a-icon> Repo's secret</span>
      <p>Repository's secret is:
        <a-input class="mono-inline disabled-input-emph" :value="newSecret" :disabled="true"
                 style="font-size:200%; padding: 20px"></a-input></p>

      <div style="font-size: 80%">
      <p>To sync data from Github to refto.dev you should add webhook to your
        repository on GitHub. To do so just follow this steps:</p>
      <ol>
        <li>Visit <a :href="newWebhookAdd(this.newSecretRepo)" target="_blank" class="mono-inline">{{
            newWebhookAdd(this.newSecretRepo)
          }}</a> to add new webhook for <span class="mono-inline"> <a-icon type="github"></a-icon> {{
            this.newSecretRepo
          }}</span>. You'll see a form for adding new webhook for this repository. You'd have to configure only 3 first
          inputs:
          <ol>
            <li>For <strong>Payload URL</strong> enter
              <a-input class="mono-inline disabled-input-emph" value="https://refto.dev/api/hooks/data-pushed/"
                       :disabled="true"  size="small"  style="font-size: 100%"></a-input>
            <li>For <strong>Content type</strong> select <span class="mono-inline">application/json</span></li>
            <li>For <strong>Secret</strong> enter
              <a-input class="mono-inline disabled-input-emph" :value="newSecret" :disabled="true"
                       size="small"  style="font-size: 100%"></a-input>
            </li>
          </ol>
        </li>
        <li>After you have added your webhook, push something to your repository to trigger it. refto.dev's server will
          receive information about your repository along with <strong>secret</strong> you set, if it is correct, your
          repository will be marked as confirmed and will by synced everytime you'll push something to it.
        </li>
      </ol>
      </div>
    </a-modal>
  </a-layout>
</template>
<script>
import UserMenu from "@/components/UserMenu";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import CreateForm from "@/components/repositories/CreateForm";
import UpdateForm from "@/components/repositories/UpdateForm";
import Vue from 'vue'
import moment from 'moment'

export default {
  data() {
    return {
      error: "",
      loading: false,
      createFormModal: false,
      updateFormModal: false,
      newSecretModal: false,
      newSecret: "a1b2c3",
      newSecretRepo: "",
      data: [],
      page: 1,
      dataCount: 0,
      pagination: {
        pageSize: 25,
        current: 1,
      },
      createForm: null,
      editForm: null,
    };
  },

  beforeMount() {
    this.loadData()
  },

  mounted() {

  },

  components: {
    UserMenu,
    Footer,
    Logo,
    CreateForm,
    UpdateForm
  },

  methods: {
    loadData() {
      this.error = ""
      this.loading = true
      let path = 'user/repositories/'
      let qs = []
      // qs.push("wec=true");
      if (this.pagination.current > 1) {
        qs.push("page=" + this.pagination.current);
      }
      if (this.pagination.pageSize > 0) {
        qs.push("limit=" + this.pagination.pageSize);
      }
      if (qs.length > 0) {
        path += "?" + qs.join("&")
      }

      try {
        this.$axios.$get(path).then((resp) => {
          this.data = resp.data
          this.pagination.total = resp.count
        })
      } catch (e) {
      }
      this.loading = false
    },

    showCreateForm() {
      this.createFormTitle = 'Add repository'
      this.createFormTitleIcon = 'plus'
      this.createFormModal = true
      Vue.nextTick(() => {
        this.$refs.createForm.$refs.path.focus();
        const form = this.$refs.createForm.form;
        form.setFieldsValue({
          'path': '',
          'name': '',
          'description': '',
          'type': 'private',
        })
      })
    },

    showUpdateForm(elem) {
      this.updateFormModal = true
      Vue.nextTick(() => {
        this.$refs.updateForm.$refs.name.focus();
        const form = this.$refs.updateForm.form;
        form.setFieldsValue({
          'path': elem.path,
          'name': elem.name,
          'description': elem.description,
          'type': elem.type,
          'id': elem.id,
        })
      })
    },

    handleDeleteRepository(id) {
      this.loading = true
      this.$axios.$delete('/repositories/' + id + '/').then((resp) => {
        this.$message.success('Repository deleted');
        this.loadData()
      })
      this.loading = false
    },

    handleCreateRepository() {
      const form = this.$refs.createForm.form;
      form.validateFields((err, values) => {
        if (err) {
          return;
        }

        this.error = ""
        this.loading = true

        this.$axios.$request({method: "POST", url: "/repositories/", data: values}).then((resp) => {
          this.newSecretModal = true
          this.newSecret = resp.secret
          this.newSecretRepo = values.path
          this.loadData()
        })
        this.loading = false
        form.resetFields();
        this.createFormModal = false
      })
    },

    handleUpdateRepository() {
      const form = this.$refs.updateForm.form;
      form.validateFields((err, values) => {
        if (err) {
          return;
        }

        this.error = ""
        this.loading = true

        this.$axios.$request({method: "PUT", url: "/repositories/" + values.id + "/", data: values}).then((resp) => {
          this.loadData()
        })
        this.loading = false
        form.resetFields();
        this.updateFormModal = false
      })
    },

    handleNewSecret(elem) {
      this.error = ""
      this.loading = true

      this.$axios.$request({method: "POST", url: "/repositories/" + elem.id + "/secret/"}).then((resp) => {
        this.newSecretModal = true
        this.newSecret = resp.secret
        this.newSecretRepo = elem.path
        this.loadData()
      })
      this.loading = false
    },

    handleCancelCreateRepository() {
      this.createFormModal = false
    },
    handleCancelUpdateRepository() {
      this.updateFormModal = false
    },
    getTypeIcon(t) {
      if (t === "private") {
        return "lock"
      }
      if (t === "public") {
        return "eye"
      }
      if (t === "hidden") {
        return "eye-invisible"
      }
    },
    getTypeColor(t) {
      if (t === "private") {
        return "green"
      }
      if (t === "public") {
        return "orange"
      }
      if (t === "hidden") {
        return "blue"
      }
    },
    getConfirmedText(v) {
      return v ? 'confirmed' : 'not confirmed'
    },
    getConfirmedIcon(v) {
      return v ? 'safety-certificate' : 'warning'
    },
    getConfirmedColor(v) {
      return v ? 'green' : 'red'
    },
    newWebhookAdd(repo) {
      repo = repo.replace(/^\/|\/$/g, '');
      return "https://github.com/" + repo + "/settings/hooks/new"
    },
    handleNewSecretModalClose() {
      this.newSecret = ""
      this.newSecretRepo = ""
    },
    hasData() {
      if  (!this.data) {
        return false
      }

      return this.data.length > 0
    },
    getImportStatus(el) {
      let err = ""
      let status = '<i class="fas fa-check-circle"></i> ' + el.import_log
      if (el.import_status === 'error') {
        err = el.import_log
        status = '<span style="color:red"><i class="fas fa-exclamation-triangle"></i> Import failed</span>'
      }

      let log = 'Last import at: '+ moment(el.import_at).calendar() +' <div role="separator" class="ant-divider ant-divider-vertical"></div> ' + status

      if (err !== "") {
        log += "<br>" + '<span style="color:red">&gt; ' + err + "</span>"
      }

      return log
    },
    getRepoName(el) {
      if (el.name === "") {
        return el.path
      }

      return el.name
    },
  },

  watch: {},
  computed: {},
};
</script>

<style>
.repoCardTitleTag {
  font-size: 13px;
}
.import-status {
  font-family: "Roboto Mono", monospace;
  font-size: 80%;
}
</style>
