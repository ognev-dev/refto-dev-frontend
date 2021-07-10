<template>
  <a-layout-footer>
    <a-row class="footerLinks">
      <a-col :span="8">
<!--        <p><a href="https://refto.dev">refto.dev</a></p>-->
        <ul>
          <li>
            <i class="fab fa-github"></i>
            <a href="https://github.com/refto/frontend" target="_blank">Frontend source</a>
          </li>
          <li>
            <i class="fab fa-github"></i>
            <a href="https://github.com/refto/server" target="_blank">Server source</a>
            </li>
        </ul>
      </a-col>
      <a-col :span="8">
        <ul>
          <li>
            <a-icon type="question" />
            <a href="https://github.com/refto/data#how-it-works" target="_blank">How it works (FIX)</a></li>
        </ul>
      </a-col>
      <a-col :span="8">
        <ul>
          <li>
            <i class="fas fa-list"></i>
            <a href="https://github.com/refto/data">Repositories</a></li>
        </ul>
      </a-col>
    </a-row>
  </a-layout-footer>
</template>

<script>
    export default {}
</script>

<style>
  .footerLinks {
    /*font-size: 16px;*/
  }

  .footerLinks li {
    list-style: none;
    padding: 5px;
  }

  .footerLinks li a {
    color: #00ace5;
    text-decoration: none;
  }

  .footerLinks li a:hover {
    color: white;
    text-decoration: underline;
  }

  .ant-layout-footer {
    background: #001529;
  }

  .ant-layout-footer * {
    color: #ececec;
  }
</style>
