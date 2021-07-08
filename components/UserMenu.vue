<template>
  <div id="userMenu">
    <template v-if="!auth">
      <a-button type="primary" size="large" icon="github" :href="$config.githubAuthAddr">
        Connect
      </a-button>
    </template>
    <template v-else>
      <a-dropdown :trigger="['click']">
        <a id="userMenuHeader">
          <span id="userMenuUsername"> {{this.auth.user.login}} <a-icon type="down" /></span>
          <a-avatar :src="this.auth.user.avatar_url"  shape="square" :size="64"/>
        </a>
        <a-menu slot="overlay">
          <a-menu-item key="0" class="userMenuElement">
            <NuxtLink to="/pages/collections"><a-icon type="unordered-list" /> My collections</NuxtLink>
          </a-menu-item>
          <a-menu-item key="1" class="userMenuElement">
            <NuxtLink to="/pages/repositories"><a-icon type="unordered-list" /> My repositories</NuxtLink>
          </a-menu-item>
          <a-menu-divider />
          <a-menu-item key="3" @click="this.logout"  class="userMenuElement">
            <a-icon type="logout" /> Logout
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </template>
  </div>
</template>

<script>
    export default {
        data() {
            return {
                auth: null,
            };
        },

        beforeMount() {
            this.auth = this.$store.state.auth
        },

        methods: {
            logout() {
                this.$store.commit('setAuth', null)
                this.auth = null
            },
        },
    }
</script>

<style>
  #userMenu {
    float: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }

  .ant-avatar-square {
    border-radius: 0;
  }

  .userMenuElement {
    font-size: 14px;
    padding: 10px 20px;
  }

  #userMenuHeader {
    color: #ececec;
    font-size: 18px;
  }

  @media only screen and (max-width: 1000px) {
    #userMenuUsername {
      display: none;
    }
  }

  @media only screen and (max-width: 1200px) {
    #userMenuHeader {
      font-size: 14px;
    }
  }

</style>
