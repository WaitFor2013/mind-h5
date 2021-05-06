<template>
  <el-container style="width: 100%; height: 100%;">
    <el-main style="width: 100%; height: calc(100% - 80px);padding:0">
      <el-table
        size="mini"
        border
        stripe
        :data="rowData"
        :height="table.height"
        v-loading="loading"
      >
        <el-table-column type="index" label="序号"  align="center" width="50">
        </el-table-column>
        <el-table-column prop="name" label="证券简称" width="100" fixed="left">
        </el-table-column>
        <el-table-column prop="code" label="证券代码" width="100">
        </el-table-column>
        <el-table-column prop="num" label="机构数" sortable :formatter="formatJG" width="100">
        </el-table-column>
<el-table-column prop="changeFundNum" label="机构变更" sortable width="110">
        </el-table-column>
        
        <el-table-column
          prop="positionValue"
          label="持仓市值(亿)"
          sortable
          width="150"
          :formatter="formatPosition"
        >
        </el-table-column>
        <el-table-column prop="turnover" label="今成交(亿)" sortable :formatter="formatNumber" align="right" width="120">
        </el-table-column>
        <el-table-column prop="currentPrice" label="当前价(元)" :formatter="formatNumber" align="right" width="100">
        </el-table-column>
        <el-table-column
          prop="todayPercent"
          label="今涨跌(%)"
          sortable
           align="right"
          :formatter="formatPercent"
          width="130"
        >
        </el-table-column>
        <el-table-column
          prop="benchmarkPrice"
          label="基准价(元)"
          align="right"
          sortable
          :formatter="formatNumber"
          width="110"
        >
        </el-table-column>
        <el-table-column
          prop="benchmarkPercent"
          label="基准(%)"
          align="right"
          sortable
          :formatter="formatPercent"
          width="100"
        >
        </el-table-column>
      </el-table>
    </el-main>
    <el-footer style="height:30px;padding:3px 0 0 0">
      <el-tag size="mini">{{sumText}}</el-tag>
    </el-footer>
    <el-drawer
  title="查询条件"
  :visible.sync="drawer"
  size="90%"
  direction="ltr">
      <el-form
        size="mini"
        ref="query"
        :model="query"
        style="overflow:auto;border:1px solid #eee;padding:5px"
        label-width="95px"
      >
        <el-form-item label="关键字">
          <el-input v-model="query.keywords" type="text"></el-input>
        </el-form-item>
        <el-form-item label=">机构数">
          <el-input v-model="query.fundNum" type="number"></el-input>
        </el-form-item>
        <el-form-item label=">持仓市值(亿)">
          <el-input v-model="query.holdMarketValue" type="number"></el-input>
        </el-form-item>
        <el-form-item label="基准日期">
          <el-date-picker
            v-model="query.benchmarkDate"
            type="date"
            value-format="yyyyMMdd"
            placeholder="基准日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="持仓日期">
          <el-date-picker
            v-model="query.declareDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="持仓日期"
          >
          </el-date-picker>
        </el-form-item>
         <el-form-item label="持仓基准">
          <el-date-picker
            v-model="query.benchDeclareDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="持仓基准"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" type="primary" @click="queryRemote">查询</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
    <div class="refresh">
      <el-button type="primary" icon="el-icon-search" circle @click="drawerOpen"></el-button>
    </div>
  </el-container>
</template>

<script>
import numeral from "numeral";

export default {
  name: "App",
  data() {
    return {
      query: {
        keywords: "",
        benchmarkDate: "20210419",//价格比较日期
        declareDate:'2021-03-31',//持仓日期
        benchDeclareDate:'2020-12-31',//持仓基准
        fundNum: 5,
        holdMarketValue: 5
      },
      drawer: false,
      rowData: null,
      loading: true,
      sumText: '',
      table: {
        height: window.innerHeight - 30,
      },
    };
  },
  created() {
    this.queryRemote();
  },
  methods: {
    drawerOpen(){
        this.drawer = true;
    },  
    queryRemote() {
      this.loading = true;
      this.drawer = false;
      this.$axios({
        url: "/mind/fund/stock",
        method: "get",
        params: {
          keywords:this.query.keywords,
          benchmarkDate: this.query.benchmarkDate,
          declareDate: this.query.declareDate,
          benchDeclareDate: this.query.benchDeclareDate,
          fundNum: this.query.fundNum,
          holdMarketValue: this.query.holdMarketValue
        },
      })
        .then((res) => {
          this.rowData = res.data;
          this.loading = false;
          this.sumText = '合计：'+this.rowData.length;
        })
        .catch((error) => {
          this.$message.error("获取证券信息出错");
          this.loading = false;
        });
    },
    formatPercent(row, column, cellValue, index) {
      if (null == cellValue) {
        return "";
      }
      return numeral(cellValue).format("0.00") + "%";
    },
    formatPosition(row, column, cellValue, index) {
      //params.data
      let arrow = "";
      if (row.lastFundPosition) {
        if (row.lastFundPosition > cellValue) {
          arrow = "⬇" + numeral(row.lastFundPosition - cellValue).format("0");
        } else {
          arrow = "⬆" + numeral(cellValue - row.lastFundPosition).format("0");
        }
      }
      return numeral(cellValue).format("0,0") + " " + arrow;
    },
    formatNumber(row, column, cellValue, index) {
        if (null == cellValue) {
        return "";
      }
      return numeral(cellValue).format("0.00");
    },
    formatJG(row, column, cellValue, index) {
         if (null == cellValue) {
            return "";
          }
          let arrow = "";
          if (row.lastFundNum) {
            if (row.lastFundNum > cellValue) {
              arrow = "⬇" + (row.lastFundNum - cellValue);
            } else {
              arrow = "⬆" + (cellValue - row.lastFundNum);
            }
          }
          return cellValue + " " + arrow;
    }
  },
};
</script>

<style lang="less">
form {
  padding: 10px 0 5px 0;
}
thead {
  th.is-leaf {
    color: #ffffff;
    background: #409eff;
  }
}
.refresh{
    position: fixed;
    font-size: 30px;
    right: 20px;
    bottom:50px;
  }
</style>
