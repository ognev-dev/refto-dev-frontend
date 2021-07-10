<template>
  <div>
    <nuxt/>
  </div>
</template>


<script>
    export default {
        data() {
            return {
                requestErrors: null,
            };
        },

        created() {
            this.unsubscribe = this.$store.subscribe((mutation, state) => {
                if (mutation.type === 'setRequestError') {
                    let err = state.requestError
                    if (!err.response) {
                        this.$notification.error({
                            message: 'Whoops',
                            description: "Unable to connect to API server. Either you have problems with network connection or API server is down.",
                            duration: null
                        });
                    } else {
                        const code = err.response.status
                        let resp = err.response.data
                        if (resp.error) { resp = resp.error }
                        if (resp === "") { resp = "Something went wrong :(" }
                        let dur = 5
                        if (code >= 500) {
                            dur = 0
                        }
                        let message = err.response.statusText
                        if (!message) {
                            message = code + " happens"
                        }
                        this.$notification.error({
                            message: message,
                            description: resp,
                            duration: dur
                        });
                        console.error(err)
                    }
                }
            });
        },
        beforeDestroy() {
            this.unsubscribe();
        },


    }
</script>

<style>
  body {
    font-family: 'Roboto', sans-serif !important;
    font-weight: 300;
  }

  .ant-card {
    box-shadow: none;
    border: none;
    margin-bottom: 20px;
    padding-bottom: 2px;
    border-radius: 5px;
  }

  .ant-card:hover {
    box-shadow: inset 0 0 0 2px #168be5, 0 0 8px rgba(0, 0, 0, 0.2);
  }

  .ant-card-head {
    border-bottom: none;
    font-weight: 300;
    font-size: 22px;
  }

  .ant-card-body {
    padding-top: 0;
    padding-bottom: 0;
    /*font-size: 120%;*/
  }

  .ant-card-actions > li {
    width: auto;

  }

  .ant-card-actions {
    margin: 2px;
    text-align: center;
  }

  .ant-card-actions li {
    margin: 2px;
    text-align: center;
  }

  .repoCardAddr {
    font-family: 'Roboto Mono', monospace;
    font-weight: 400;
  }

  .ant-card-head-title {
    font-family: 'Roboto Slab', sans-serif;
    font-weight: 400;
    font-size: 20px;
  }
  .ant-tag {
    font-family: 'Roboto', sans-serif;
    font-weight: 400;
  }

  strong {
    font-weight: 700;
  }

  .mono-inline {
    font-family: "Roboto Mono", monospace;
  }

  .disabled-input-emph {
    color: #168be5 !important;
    cursor: text !important;
  }

  .ant-form-explain {
    font-size: 90%;
  }

</style>
