<template>
  <a-form layout='vertical' :form="form">
    <a-form-item label='Repository' :help="'A path where your repository is located, like https://github.com/{account}/{repo}'">
      <a-input ref="path"  addon-before="https://github.com/"
               placeholder="{account}/{repo}"
               v-decorator="[
              'path',
              {
                rules: [{ required: true, message: 'Please input path of repository!' }],
              }
            ]"
      />
    </a-form-item>
    <a-form-item label='Display name' :help="'Optional. If not provided repo\'s path will be used'">
      <a-input type="hidden" v-decorator="['id']"/>
      <a-input ref="name"
        v-decorator="[
              'name',
              {
              }
            ]"
      />
    </a-form-item>
    <a-form-item label='Description'  :help="'Optional. If not provided repo\'s description will be used'">
      <a-textarea ref="description" v-decorator="['description']"/>
    </a-form-item>
    <a-form-item label="Visibility">
      <a-radio-group
        name="type"
        v-decorator="[
              'type',
              {
                initialValue: 'private',
              }
            ]"
      >
        <a-radio value="private"><a-icon type="lock" /> <b>Private</b>: Available only to you</a-radio><br>
        <a-radio value="public"><a-icon type="eye" />  <b>Public</b>: Available to anyone</a-radio><br>
        <a-radio value="hidden"><a-icon type="eye-invisible" /> <b>Hidden</b>: Not listed, but available to those who have a link</a-radio>
      </a-radio-group>
    </a-form-item>
  </a-form>
</template>

<script>
    export default {
        props: ['edit'],
        data() {
            return {
                form: this.$form.createForm(this, { name: 'create-repository' }),
            };
        },
    }
</script>

<style>
</style>
