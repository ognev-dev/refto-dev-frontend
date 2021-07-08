<template>
  <a-layout>
    <a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%' }">
      <a-row>
        <a-col :span="12">
          <Logo />
        </a-col>
        <a-col :span="12">
          <UserMenu />
        </a-col>
      </a-row>
    </a-layout-header>
    <a-layout-content  :style="{ margin: '20px', marginTop: '84px', background: '#fff', padding: '24px' }">
      <a-row>
        <a-col :span="18"><h1>My collections</h1></a-col>
        <a-col :span="6">
          <a-button type="primary" icon="plus" style="float: right" @click="showCreateForm">
            Create collection
          </a-button>
        </a-col>
      </a-row>
      <a-table :columns="dataColumns" :data-source="this.data" :show-header="false" :pagination="pagination"
               :loading="loading" @change="handleTableChange" :row-key="elem => elem.id">
        <span slot="name" slot-scope="val, elem"><NuxtLink :to="'/#c:'+elem.token">{{ val }}</NuxtLink></span>
        <span slot="private" slot-scope="priv">
          <a-tag color="green" v-if="priv">
            <a-icon type="lock" /> PRIVATE
          </a-tag>
        </span>
        <span slot="entities_count" slot-scope="count" title="Entities in collection">
          <a-icon type="file-text" /> {{ count }}
        </span>
        <span slot="actions" slot-scope="text, elem">
          <a @click="editCollection(elem)">Edit</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="Are you sure want to delete this collection? This action cannot be undone."
            ok-text="Yes"
            cancel-text="No"
            @confirm="deleteCollection(elem.id)"
          ><a href="#">Delete</a></a-popconfirm>

        </span>
      </a-table>
    </a-layout-content>
    <Footer />
    <a-modal v-model="createFormModal">
      <span slot="title"><a-icon :type="createFormTitleIcon"></a-icon> {{createFormTitle}}</span>
      <CreateForm ref="createForm" />
      <template slot="footer">
        <a-button key="back" @click="handleCancelCreateCollection">
          Cancel
        </a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleCreateCollection">
          Create
        </a-button>
      </template>
    </a-modal>
  </a-layout>
</template>
<script>
    import UserMenu from "@/components/UserMenu";
    import Footer from "@/components/Footer";
    import Logo from "@/components/Logo";
    import CreateForm from "@/components/collections/CreateForm";
    import Vue from 'vue'

    const dataColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            scopedSlots: { customRender: 'name' },
        },
        {
            title: 'Entities',
            dataIndex: 'entities_count',
            key: 'entities_count',
            scopedSlots: { customRender: 'entities_count' },
        },
        {
            title: 'Private',
            dataIndex: 'private',
            key: 'private',
            scopedSlots: { customRender: 'private' },
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            scopedSlots: { customRender: 'actions' },
        },
    ];

    export default {
        data() {
            return {
                error: "",
                loading: false,
                createFormModal: false,
                data: [],
                page: 1,
                dataCount: 0,
                pagination: {
                    pageSize: 25,
                    current: 1,
                },
                createForm: null,
                createFormTitle: '',
                createFormTitleIcon: '',
                dataColumns,
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
            CreateForm
        },

        methods: {
            loadData() {
                this.error = ""
                this.loading = true
                // todo: there must be a better way to searialize array into query string
                let path = '/collections/'
                let qs = []
                qs.push("wec=true");
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
                } catch (e) {}
                this.loading = false
            },

            handleTableChange(pagination, filters, sorter) {
                const pager = { ...this.pagination };
                pager.current = pagination.current;
                this.pagination = pager;

                this.loadData()
            },

            showCreateForm() {
                this.createFormTitle = 'Create collection'
                this.createFormTitleIcon = 'plus'
                this.createFormModal = true
                Vue.nextTick(() => {
                    this.$refs.createForm.$refs.name.focus();
                    const form = this.$refs.createForm.form;
                    form.setFieldsValue({
                        'name': '',
                        'private': 'true',
                        'id': 0,
                    })
                })
            },
            deleteCollection(id) {
                this.loading = true
                this.$axios.$delete('/collections/' + id + '/').then((resp) =>  {
                    this.$message.success('Collection deleted');
                    this.loadData()
                })
                this.loading = false
            },
            editCollection(elem) {
                this.createFormTitle = 'Edit collection'
                this.createFormTitleIcon = 'edit'
                this.createFormModal = true
                Vue.nextTick(() => {
                    this.$refs.createForm.$refs.name.focus();
                    const form = this.$refs.createForm.form;
                    form.setFieldsValue({
                            'name': elem.name,
                            'private': elem.private ? 'true' : 'false',
                            'id': elem.id,
                    })
                })
            },
            handleCreateCollection() {
                const form = this.$refs.createForm.form;
                form.validateFields((err, values) => {
                    if (err) {
                        return;
                    }

                    this.error = ""
                    this.loading = true

                    // TODO
                    // can't find how to make form value of type bool
                    // so should cast it here :(
                    values.private = values.private === "true"

                    let method = "POST"
                    let url = "/collections/"
                    // create collection
                    if (values.id !== undefined && values.id !== 0) {
                        method = "PUT"
                        url += values.id+"/"
                    }
                    this.$axios.$request({method: method, url: url, data: values}).then((resp) =>  {
                      // TODO instead of reload it is more convenient to add newly created collection to
                        // "new collections" section
                        // because if user browsing collections not on first or last page
                        // he will not see newly created collection
                        this.loadData()
                    })
                    this.loading = false
                    form.resetFields();
                    this.createFormModal = false
                })

            },
            handleCancelCreateCollection() {
                this.createFormModal = false
            },
        },

        watch: {},

        computed: {},
    };
</script>

<style>
</style>
