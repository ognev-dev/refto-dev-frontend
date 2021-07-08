<template>
  <a-form layout='vertical' :form="form">
    <a-form-item label='Repository' :help="'Repository\'s path cannot be changed once saved. (Create new repository with new name)'">
      <a-input type="hidden" v-decorator="['id']"/>
      <a-input ref="path"   :disabled="true" addon-before="https://github.com/"
               placeholder="{account}/{repo}"
               v-decorator="[
              'path',
              {}
            ]"
      />
    </a-form-item>
    <a-form-item label='Display name' >
      <a-input type="hidden" v-decorator="['id']"/>
      <a-input ref="name"
        v-decorator="[
              'name',
              {
              }
            ]"
      />
    </a-form-item>
    <a-form-item label='Description' >
      <a-textarea ref="description" v-decorator="['description']"/>
    </a-form-item>

    <a-form-item  label='Visibility'>
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
                form: this.$form.createForm(this, { name: 'update-repository' }),
            };
        },
    }
</script>

<style>
</style>
