<template>
  <el-container style="width: 100%; height: 100%;">
    <el-main style="width: 100%; height: calc(100% - 80px);padding:0">
      <el-table
        size="mini"
        border
        stripe
        :data.sync="rowData"
        :height="table.height"
        v-loading="loading"
        :highlight-current-row="highlight"
        @row-click="rowClick"
      >
        <el-table-column type="index" label="序号" align="center" width="50">
        </el-table-column>
        <el-table-column prop="name" label="证券简称" width="100" fixed="left">
        </el-table-column>
        <el-table-column prop="code" label="证券代码" width="100">
        </el-table-column>
        <el-table-column
          prop="num"
          label="机构数"
          sortable
          :formatter="formatJG"
          width="100"
        >
        </el-table-column>
        <el-table-column
          prop="changeFundNum"
          label="机构变更"
          sortable
          width="110"
        >
        </el-table-column>

        <el-table-column
          prop="positionValue"
          label="持仓市值(亿)"
          sortable
          width="150"
          :formatter="formatPosition"
        >
        </el-table-column>
        <el-table-column
          prop="turnover"
          label="今成交(亿)"
          sortable
          :formatter="formatNumber"
          align="right"
          width="120"
        >
        </el-table-column>
        <el-table-column
          prop="currentPrice"
          label="当前价(元)"
          :formatter="formatNumber"
          align="right"
          width="100"
        >
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
        <el-table-column prop="address" label="地址" width="300" :show-overflow-tooltip="true">
        </el-table-column>
        <el-table-column prop="description" label="描述" width="300" :show-overflow-tooltip="true">
        </el-table-column>
      </el-table>
    </el-main>
    <el-footer style="height:30px;padding:3px 0 0 0">
      <el-tag size="mini">{{ sumText }}</el-tag>
    </el-footer>
    <el-drawer
      title="查询条件"
      :visible.sync="drawer"
      size="90%"
      direction="ltr"
    >
      <el-form
        size="mini"
        ref="query"
        :model="query"
        style="overflow:auto;padding:5px"
        label-width="100px"
      >
        <el-form-item label="关键字">
          <el-input v-model="query.keywords" type="text"></el-input>
        </el-form-item>
        <el-form-item label="标记">
          <el-switch v-model="query.check"> </el-switch>
        </el-form-item>
        <el-form-item label="机构数(>)">
          <el-input v-model="query.fundNum" type="number"></el-input>
        </el-form-item>
        <el-form-item label="持仓市值(>亿)">
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
          <el-button size="mini" type="primary" @click="queryRemote"
            >查询</el-button
          >
        </el-form-item>
      </el-form>
    </el-drawer>
    <el-drawer
      title="详情"
      :visible.sync="detailDrawer"
      size="100%"
      direction="ttb"
    >
      <div>
        <el-tag>序号 {{ selectRow.index + 1 }}</el-tag>
        <el-tag>{{ selectRow.code }}</el-tag>
        <el-tag>{{ selectRow.name }}</el-tag>
      </div>
      <div>
        <el-tag>本次{{ selectRow.num }}家</el-tag
        ><el-tag style="color:red">加({{ selectRow.changeFundNum }})家</el-tag>
        <el-tag>持仓{{ selectRow.positionValue }}亿</el-tag
        ><el-tag style="color:red"
          >加{{
            numHandle(selectRow.positionValue, selectRow.lastFundPosition)
          }}亿</el-tag
        >
      </div>
      <div></div>
      <img
        style="width:100%;margin-top:10px"
        :src="stockImage"
        @click="openOtherHq"
      />
      <el-divider content-position="left">分析记录</el-divider>
      <div class="remark">
        <el-input
          class="bz"
          type="textarea"
          placeholder=""
          v-model="remark"
        ></el-input>
        <el-button
          class="bt"
          type="primary"
          icon="el-icon-check"
          @click="saveRemark"
          circle
        ></el-button>
        <div class="line">
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in remarkList"
              :key="index"
              :timestamp="activity.formatTime"
            >
              {{ activity.remark }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <div
        style="position:fixed; bottom:0;border-top:1px solid #eee;width:100%;padding:5px"
      >
        <el-button
          type="primary"
          icon="el-icon-arrow-left"
          @click="beforeRow"
          style="float:left"
          >上一个</el-button
        >
        <el-button
          type="primary"
          icon="el-icon-arrow-right"
          @click="nextRow"
          style="float:right"
          >下一个</el-button
        >
        <el-switch
          v-model="selectRow.mark"
          @change="markClick"
          active-text="标记"
          style="float:right"
          >标记</el-switch
        >
      </div>
    </el-drawer>
    <div class="refresh">
      <el-button
        type="primary"
        icon="el-icon-search"
        circle
        @click="drawerOpen"
      ></el-button>
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
        benchmarkDate: "20210430", //价格比较日期
        declareDate: "2021-03-31", //持仓日期
        benchDeclareDate: "2020-12-31", //持仓基准
        fundNum: 5,
        holdMarketValue: 5,
      },
      highlight: true,
      drawer: false,
      detailDrawer: false,
      stockImage: "",
      rowData: [],
      loading: true,
      sumText: "",
      remark: "",
      remarkList: [],
      selectRow: {},
      table: {
        height: window.innerHeight - 30,
      },
    };
  },
  created() {
    this.queryRemote();
  },
  methods: {
    drawerOpen() {
      this.drawer = true;
    },
    queryRemote() {
      this.loading = true;
      this.drawer = false;
      this.$axios({
        url: "/mind/fund/stock",
        method: "get",
        params: {
          keywords: this.query.keywords,
          benchmarkDate: this.query.benchmarkDate,
          declareDate: this.query.declareDate,
          benchDeclareDate: this.query.benchDeclareDate,
          fundNum: this.query.fundNum,
          holdMarketValue: this.query.holdMarketValue,
          check: this.query.check,
        },
      })
        .then((res) => {
          this.rowData = res.data;
          this.loading = false;
          this.sumText = "合计：" + this.rowData.length;
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
      row.index = index;
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
    },
    rowClick(row) {
      this.detailDrawer = true;
      this.selectRow = row;

      let append = "http://image.sinajs.cn/newchart/daily/n/";

      if (row.code.startsWith("6")) {
        append += "sh" + row.code;
      } else {
        append += "sz" + row.code;
      }
      append += ".gif";
      this.stockImage = append;
      this.remark = "";
      this.$axios({
        url: "/mind/logQuery",
        method: "post",
        params: {
          code: this.selectRow.code,
        },
      })
        .then((res) => {
          this.remarkList = res.data;
        })
        .catch((error) => {
          this.$message.error("获取备注信息失败");
        });
    },
    beforeRow() {
      let currentIndex = this.selectRow.index;
      if (currentIndex != 0) {
        let selectRow;
        this.rowData.forEach((tmp) => {
          if (tmp.index == currentIndex - 1) selectRow = tmp;
        });

        this.rowClick(selectRow);
      } else {
        this.$message.error("已到开头");
      }
    },
    nextRow() {
      let currentIndex = this.selectRow.index;
      if (currentIndex + 1 != this.rowData.length) {
        let selectRow;
        this.rowData.forEach((tmp) => {
          if (tmp.index == currentIndex + 1) selectRow = tmp;
        });

        this.rowClick(selectRow);
      } else {
        this.$message.error("已到结尾");
      }
    },
    markClick(value) {
      if (value) {
        this.$axios({
          url: "/mind/mark",
          method: "post",
          params: {
            code: this.selectRow.code,
          },
        })
          .then((res) => {})
          .catch((error) => {
            this.$message.error("标记失败");
          });
      } else {
        this.$axios({
          url: "/mind/unMark",
          method: "post",
          params: {
            code: this.selectRow.code,
          },
        })
          .then((res) => {})
          .catch((error) => {
            this.$message.error("取消标记失败");
          });
      }
    },
    saveRemark() {
      this.$axios({
        url: "/mind/logCreate",
        method: "post",
        params: {
          code: this.selectRow.code,
          remark: this.remark,
        },
      })
        .then((res) => {
          this.rowClick(this.selectRow);
        })
        .catch((error) => {
          this.$message.error("保存信息失败");
        });
    },
    openOtherHq() {
      window.open("http://stockpage.10jqka.com.cn/" + this.selectRow.code);
    },
    numHandle(p, lp) {
      return numeral(p - lp).format("0");
    },
  },
};
</script>

<style lang="less">
.el-tag {
  margin: 5px 0 0 5px;
}
form {
  padding: 10px 0 5px 0;
}
thead {
  th.is-leaf {
    color: #ffffff;
    background: #409eff;
  }
}
.refresh {
  position: fixed;
  font-size: 30px;
  right: 20px;
  bottom: 50px;
}
.el-drawer__header {
  padding: 5px !important;
  border-bottom: 1px solid #eee;
  margin-bottom: 5px !important;
}
.el-timeline {
  padding-left: 10px;
}
.el-textarea {
  width: 70% !important;
  margin-right: 10px;
}
.remark {
  .bz{
    margin-left: 10px;
  }
  .bt {
    padding-bottom: 10px;
  }
  .line {
    margin: 10px 5px 5px 0;
  }
}
</style>
