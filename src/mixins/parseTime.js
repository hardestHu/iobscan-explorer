import Tools from "../util/Tools";

const parseTimeMixin = {
  data() {
    return {
      txListTimer: null,
    };
  },
  methods: {
    /**
     * @description: parse Age
     * @param {*} txListKeys need to parse listKey or listKeylists
     * @param {*} key origin key
     * @param {*} parsedKey parsedKey
     * @return {*} null
     */
    parseTime(txListKeys, key, parsedKey) {
      if (!txListKeys) {
        return;
      }

      !this.txListTimer &&
        (this.txListTimer = setInterval(() => {
          Array.isArray(txListKeys)
            ? txListKeys.forEach((txListKey) => {
                this[txListKey].forEach((item) => {
                  item[parsedKey] = Tools.formatAge(
                    Tools.getTimestamp(),
                    item[key] * 1000,
                    this.$t("ExplorerLang.table.suffix")
                  );
                });
              })
            : this[txListKeys].forEach((item) => {
                item[parsedKey] = Tools.formatAge(
                  Tools.getTimestamp(),
                  item[key] * 1000,
                  this.$t("ExplorerLang.table.suffix")
                );
              });

          // txList.forEach(item => {
          //   if (Array.isArray(item)) {
          //     item.forEach(subItem => {
          //       subItem[parsedKey] = Tools.formatAge(
          //         Tools.getTimestamp(),
          //         subItem[key] * 1000,
          //         this.$t('ExplorerLang.table.suffix')
          //       )
          //     })
          //   } else {
          //     item[parsedKey] = Tools.formatAge(
          //       Tools.getTimestamp(),
          //       item[key] * 1000,
          //       this.$t('ExplorerLang.table.suffix')
          //     )
          //   }
          // })
        }, 3000));
    },
  },
  beforeDestroy() {
    clearInterval(this.txListTimer);
  },
};

export default parseTimeMixin;
