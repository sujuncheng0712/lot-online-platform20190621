import React, { Fragment } from 'react';
import { Link, Redirect, Switch, Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { Icon } from 'antd';
import GlobalFooter from '../components/GlobalFooter';
import styles from './UserLayout.less';
import { getRoutes } from '../utils/utils';

const links = [
  {
    key: 'help',
    title: '帮助',
    href: '',
  },
  {
    key: 'privacy',
    title: '隐私',
    href: '',
  },
  {
    key: 'terms',
    title: '条款',
    href: '',
  },
];

const copyright = (
  <Fragment>
    Copyright <Icon type="copyright" /> 2017 DGK 智能平台 &nbsp;&nbsp; 版本号：v1.0.0 2018-08-30 13:45
  </Fragment>
);

class UserLayout extends React.PureComponent {
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = 'DGK 智能平台';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - DGK 智能平台`;
    }
    return title;
  }
  render() {
    const { routerData, match } = this.props;
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.header}>
                <Link to="/">
                  <img alt="logo" className={styles.logo} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALEAAAA9CAYAAADiW4hmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF32lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOC0wNC0wNVQyMjo0OToxMyswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTgtMDctMDJUMDg6MzQ6MDIrMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTgtMDctMDJUMDg6MzQ6MDIrMDg6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODViMTg3YTktNTY4NS00Mzk3LWEwYzAtMjMzNjAxYjc5NzliIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOmEzN2I1Njg5LTI0Y2MtZjI0ZS1iZjg1LWFiYmRmNmNmNDM3YSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmEzN2I1Njg5LTI0Y2MtZjI0ZS1iZjg1LWFiYmRmNmNmNDM3YSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YTM3YjU2ODktMjRjYy1mMjRlLWJmODUtYWJiZGY2Y2Y0MzdhIiBzdEV2dDp3aGVuPSIyMDE4LTA0LTA1VDIyOjQ5OjEzKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo4NWIxODdhOS01Njg1LTQzOTctYTBjMC0yMzM2MDFiNzk3OWIiIHN0RXZ0OndoZW49IjIwMTgtMDctMDJUMDg6MzQ6MDIrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz69AAerAAAa/0lEQVR4nO2deZxO5fvH389ijDHGmM2M9dBkKYlIfb+yJNlaLEXKFomE4puSb0mibNGqqK8sRUmRypadVKRMKglxGhpmjDHGzGDMPM/vj/MczpznLPd5Zmh5/T6v17zmOdt9Xee+r3Pd13bu4/L7/fw/SgGZh9ycTqtC3okYTmck4C/ygsuHr8hLeMVsohKPERGTRbVG2X82q/80eP9sBv622L28Ealf38iRlMYc+7EB2ccSOe+rTQFwDvADLsCH0stlATcyFSrkklB/D0nX7UK67nuaP/jFn3gX/wi4/KuGjeJwyrWUK1tgeaaZwrZT5H7A7weX20dkQgZlKp6iYpU0YpIPEHfVHpIa5oTC+J+CLTNv56eVHfnj63+TfjKafCTKoAioF0VoXYA7cL5f898X+CsECoCzgAeZxLIFVG6yk0a3r6DDmEWXlP8VE3uzY3VHKoafLbbfb/IbIL8gjMTqqQxa+FSp8vLKvZPIOlyDchpeRI0CF5B2PI4r6+1l+OLRLv/MK9eSsr8tFXUn6hvUbrsC20ZEja5Tzy8K/AGEA2WRqRiXSc1bNlC71WZuGLJS8DYuL1Y+M4Btbw1GTk/Ag0QEiuB6sBYArRC7DI4XoWjtfOAcMjVjs2j18Ew6P/dO6d8EMOPWt1m6biCVDfg14zEbqFd+D2/mXl1qfEzuMJvla9oRjYTL4LiVXLmBNEBCZsqWVtRtkeolskoa0fshCuObMmvUaL/Vk6Rv2wcUIXEiUyJ1cVO2Lu7BikcLuarHhzQdMIfkNgctWrs82DGvNUtHTyE1I4FIJCpT/AG2EgL9Q6+HH2VAygERgA+JEyck5k4Yy1cLe3HfyyO59o7dpXo/UfGZxAExOj6MeFPhAWJrpJYaD2/0fp6Va9qRrBFgUTlyA38ADWO+56Wd1xNbyxfYbXKFUcdbEdIKvd25KkNlUAZR6ViJM+eT2bTwv7x+y3pm3rSQ/V/UseHi0uCPHQnMaPkub/Sfy4mMZlRBIgpjTWUGfV/or3MZHIsCqiFx+GAbXrhzOW90e8k58xZw6sNfeDBLyfmf//ATLF54H9WRLphcenpmcANHgSox3zP1yxaqAKuHrBtwMmhGgi1yvdpZ4UA8EI7Ez9vu45X2a1jSf7wgB6WDXQtvYuIN20nZ2psYJKIx1ryq/avdtrpXK6Wg196xQDQSK5d14am6axzxbwU7xaTlQT2/tIJXS558iLlvDqEKEl7M+1T7X4UbOAbElN/Di9uak1g/X3/Y+EI7OD3f6lr9thdFO5dHYtW8vkyps5bsA5c+krL2+d680vtdfEgkovSOmeAaDa6RdjWDlbnhQ5mlaiLxy746PF5rIycPGumukqMk4yiKz57vzawpo6mMRBjWClN/zA2kA1Fh+5j+ZXMq1zurv8y6Y9QGRW/USDhFDHejm/IBYUAVJOT9bZl83S72f9ZQkBPnWPrwE8x/egKRSFQM0DeCiCMH5uaEaJ+qs1MVJA7KrXn2X1/bXGEPPe92M2VpaOG10+/m5acnEItEOaz7SJUXrRN3HCjvPcD0rS3MYuzm5oRTATZqQxRmmlltLx44fboBM+5czoFVV4VIxRzrxg3gozeHEBuIPJgJsJ7HULSY0/70A0nAoYwEnm+8LASKJeOlJJr6q7ltmD5qGpUM+tXuAfIAmSix9SnrbqVmswyzU4ubE3obT4SYFqU5NWnb8qF41G4k3uq8vBSpwI5ZHXj3ubHEIVEW+3sVvUcrR87ouFUbfqAqEttTGrF6/P2CHATDaHyteCrJeKZ83JRJA+ZQDokKBCsGqyCAB8gCXMi88ElXrmwlW5GyNidEnBH9tpFdKLrP7Bz1QYoBcs57mVp7owVn4vhtfTKzhrxJpG6qC0VQC4Fc4ASKDZcR+J8e2JcbOMeJ9tOe6wZikZj77DhSd8YJcigOs1BbKLPrL2vrMObuJXgDjrEP4/s22udBiU2fQ2bix3dxbecUO3IXnSU7z9rsKbWyEY32mcVZreiptHwoA/nzIfh04NPc+b+JFlzbY373JbiQiOSipjAKFZrFf93AGeAUUB6ZmpJMtaY7ia19iIjobIoKveRmxnHy95oc/v46jhyuRlbA5g5HzGzR0isPZCOx6MG3eXJXV4d361wgQ9HER3+OZEKXZXiRqMTF5JYIP24UAc5H5rl5/Wnc7XsRktYev1nsV60JyAowaRWKUdsog+KohXHR67dzfozgAhKQWDXnAa7tP4+azY9Y3oMZ1ox+mEMno0kiWJjsHE/1/jOASsh07LeA6/vOp65NgmbvumS+eucBtr/fk3Qk4lD6wo6+Ch+QAOxMacSPnzfgmtt/sqSnh5VQOomsmCFzfxj/bb6Nk/lXkYi5AGtnPK0Tl4MiwE+9MZR/9dskSvaiEDuJCZ4HvO6DdBw2k4j4DM7nRxie53L7KDwXTt7xeE7sq8PRlEYcPxOOP6CN9GlbEfhRUr6nkFg+8G0e+aWjwxbg6O4olk19nEpIwTxr6BjBjVL7cAKZG9t9wd3THheu/6jX9gD12o6h/ZOTWDzyJb7Z0Ib4QOBfdFZSYqwSa6eO5prb+wjRNUJpxX+1GHXDdjJONSQR61lGb5u7UMytU8g8/fpwWjsrP7A2J8wE+zwQ5i2kwysznBAD4Lt32vDDh/ewa0073AGbSU9fL0hGmrESsHdvPY58m0C16009V0N8PmwmZwRCaUaaqwA4jsw9o6bTZdrrjuiqqNowh/+sf4C5fSfw6bu9qRpIwYqYYz6UzN7+r/7tmK7VGPtxpsj0GHHFetJORlMV45nFbBZwAXkoSuHJaY/TZujnTkmLxYmNrvIXhZZ8aDJgAwNWD2bQh/eQWHMLx5GFBk8PL1CAxMbx4xzRP7w9kZ1bbyIW+8414ikTma6DZ4cswFr0XzCWptfuJhO52INr9FuLcOBokZt1M7o5oidabCNyTIsnGn7GzwdrUw1JWBmq93YGyEZmxLPj6TDqI0GKxeC2ZdbMbi1pOO2a7jsYI7eiUYsvyUS2PNeIBz8QDfywopMjuqvHTKIgUEJp1L7eXtNupyPTsv0X9Jg12RFNKzyV0pn4iHxyCJ6BjKIU6vRbBomUpXc5omWXaAgFT1y9gu9+bEB1JHwYC6sR3CjlqOnIDBs/ji7j5oXIQUCInWgjO5vRKQZt6UNSTBbZBA+WHcKAk8DmyT2F6f26sTVRNudop1eVl2wgsXw+D60eLExLFF3HjyMDmZMozo3Z3ynN/yLgh23OTAoRwXUyvtNvn8mOPVdRIyDAZu2qfanuVwX4GDJDHp9Gl2cWCFAzhb1jdykcAD16vX8vM9qv4XygOMQOKq8uIAyJn5feRasnP7C97rsFLTkFF+xwFXoNpd/2AQXI9HpziAB3ztFm1Ed8//FdnMo8QHjg5QSrSI0fKPK5OZMXwa8battGRYwgktSxOud/A59m9YpO1NQ4x2bhSf32ORS/YvBj0+k59Q0xhs1hLzKlrXmNULvdPm7q/Cmblj9CvAktI+Hyo9Ti/v5tUyE6PyzqhQ8JD2IxWhU5QL2aqVzXZ4uDq5xh1Nf3XrK2Vdj1q2jG7s2eU/hwcQ+qW/Sl2UNQCBxBZuDw17jvxZL7FehrJ0ojVhgqWo6dQDlkCgPbVmlJra1aBjgN/LDIfmo9tKUlEYgPlkrvDDLXPzDHtv2/OuxMNLPjPo0T//GYh1gSEGC1pNLuevWcQiAVmV73L6Dfq84jWyawL+/T24eXClWaZJJcby/5JrS0zo7WvnKhRCmO7LTWxvtW1yPrTHhQKaCRo6qdfQqAym4ft44tkd32l4BVGNMMPqBclBIHX//anfxv8mgSdTXBRjS0/10oNnw6Mn0emMNDc51FlGzgNsyeqNva/5dDM9fvsQS1WtTOJlShZgPTUhpbtn3oy5vIC3S+lQOpj0jkAvVab7Ll/Z8AI4H0AhHR2ayc3JNXH3mFaJs6E/22msiRkbmt21IGlbBUwABeSyG9HBpYi6rNdhCBMu14Avu0D5PZA+cFco8lWrZ97MdrLngAomEgP0piJ7ntelve/w4IxVyMBH7ZNIDt6wdQASVbqi+p1EMrNz4UAb615RZGfvyYU5ZFIGZOXC7E19tLJLKho2DFhxsoyI20bPvEb8mEBX5b2W5aU6UIqIBS1PNPgVHsGcwjCy6gsEh5FzIMsZJKVckUAXmeg9zZ+VPGbe5XIr4tEHop5qVAzBWFhEdnXygqEoUHyD1uXZ548lCwI6LCbGALgSiPjzq37nPAzd8TVg+2h4txLCfjkgckJaUx6pNHS8KaHS7Ne1slQURsVlD1k9307wIKz4aTuT8MIxzfF8a5/Ag8mKdAjbYLgYrVS+919T8bWntfP+uA81nXyLHTthMBHD6WyOcT+jps2RFCq3+4lCaGv8ht6ixYpTALkMhLTyDuyuDSzNNpVTivWefALpCvHvcB4dHZoqwHYdnjw3ABHo8SONRHRUQKbsxqDgDyC73UqLuPm0JYCsusnMAORgrE7FovEF6YzOvPjEdqspMGnfY4YVEUf41khxYRcZn4ZGttacSTDyg4Y1wSmpcZx3mUwhkz59AIRUBU0jEBroOx94s6LHjxMVwGb/iK/NbvM4rWZAI3X7kuJCE2i5XrNbX+Gr2DbQRt3UkEkIfEpG7LWHi2rmM+BSCmiZ0kB0qKsgGbOBS43MZ5OLen+H4jTW8kTH6gTHjQK+JCCCufT2JA+5cxad/qtx5GwlwGiK0ph8QfmN+31flO4UNZfuHQuTBevm0mI1YMDaEVS1ysYrPLtlxOiHSWnmcX4DJh1u9zB9lvooPnKwrdbzCLR+uTNfo/0bZFZhMrfkRMKidmh1WoshoSK1d2Yutb7Wz5dIiLVWxWDF/OKEVBbmTp03MpmtipaeQHXB4nVRYaklg7PqEoB8MHN4R2zCBS5SZyvdG9lUFZDOfFwbNJ/zXcMW8WKK5lrMJPlwu56YlBMROrJxw0PJoInDb370SzeIDTNkkUK1jZjNoB1wu11XVaOH0YjB4Cpwg1muEDKgJnkZhy24oQKJtCLE58OU0K1ZM34kO/T5uUCEMmMsH4NaXwqJxiMWK7gp8LvAD5WTFmp9pCJOMpajrZ/RaFXTpfL6Qi0RPR/vQBlYGdv9Vm4dAnbFoWhpi9V9rTlhXO5kQ51sR+oIy3kMpX5xqeF1X1CGUDmUAjJ9Xs/jxAzh9VhPi2g5XwWWk3u0xlScYl1JCfUnSlKA+zsTJLILmAJCQWvDGEXzfWdsyzAewXFLzcjt3ZE3GOUzBFQHhMlunxxAa5eMsUCq2BoBVoL5CbG8mR75wvVmI1dTtxyPRmh55GScbHTjkZPVwelNJXlba+T40cTm1f+FFS2B4kpnb7ODTGi6O4uFgJstU0VFo4uKE2uUXuC5k1O75U+IHwCsZaWEUlSS6WzrYSDhVelKUBjuxqZMNBMJwIqoj2NZoxSirA+jbs2nOjrLVRvtxexm2uyR2jhpNm8H6kXUhWXT/jYHY0z7eaL8yzBVvGhM32XUqz4o9vm3HaoNhaT1cveD6UJIkVYpMPcF7Xhtqu2T25UTTNb+tvseE8GAX5EReWscrQ/Df7O4by2QN9qahVcsapmWfl1Bq1o/cPMoAIz0Ge29acui1TuWfa69SIzA0s/CfeFij9WhWJlVtasmb63YJ3YIjiyY4/IyasxcE17SmDWH2DFmeB2DrWRTqJDX6kYFXwfjvHJBL4dU0HYIxl+3rE1DrI3Q8+hcvtw+MKtjm12y4U5/PA1hb89HVPymva0YfqSnOM9P1stu1GyQ66kBn76R3UaHzRdBu5pDujOq4iP1Bn7KQC0QPEI/HOk5No/1hIr+uDXcbuckcnftnYGqOCSiMNpO7zoXRy9eu/tWy7VsstREyTKQq8F2bUlhGtcoB8Mppv57fmevGllYhPLuS+t14QPh9g8ZAovtEJsZG2DHU8QrnOjfJGeYVye3l2dXuuaFm8IKpBh70MHj2FmVNGU9VgRSUw5tuFMnbRwB+FXv5Tdw0zfm0fAod/Icdu5bBRZMGF9SBEQ1Nqza/Uwvolzvq3/0RMWAHqh85EY7EelCVlt738qA1HJcf2ef2CPgBkxJMWTsfHbpz1x/OBqOgUXtjaIkiAVXSdPIt/NUohHS74M6LxeB9KtGLHvjrMG/i0Lf8GsHfsLldobeusIVTUvf6t5cHMJj4HxCceI0ngS521bt5EnkH7VvCjBOl/TmnE4e2hJz7ssGfVVRw7G37BnFJRWo6cXRtmWv4sUKtmKtWbWPscg+b2x4tMLuIyo50FqyGxYM4D7F7RQPDqC7hYO3EpQjiimNl4GTlFbspp9omEflwohdf1uy0TotO410LcyI6WGwXljYYiJN7psViITihYMW486FYmUvmxc+5CgejYuoFz54zrtLWo3iib4VNGkxXoXxE+tX5BGMoHh2b0WijAVRCL5rgcWnj50CfYndKISpp1vPQdbNbhhUA4Mo17vSdE67o+W6iI9WLXRvvVlep/Sa3B+/ePF6LlBOsn9+Sbb5tSCXvhKkmYTWQ8SzLm7Z/4kLatN3EEOaSEVTxw6FQUU9vPdkLWbdsJpjflh5OHSvZmyKK7prPqDeVbGdrsk51Zoz7BOUDyFQep8e80YZp122zglE3bmGwnIvH5/L6sndhbmJ4dflp2He+MmUQlg2+7mYU9S8Oxc5ruFsWTG/tTIyon8LkCa+E1spurIbHii3ase6WLKMngtyhEiPkAl8dHpVrOK7yO/RTJmlHDGB/5M1uXdiNOs3SVnb2m3Va+SCpz87PjHNHvNHU0YcgXHDwRWipvXpTvyy0YO4HlYx5yRNcIW2Z1YHK3jykT+DCLXcrWir9QYORnOBV0I4xc0I88ZM5jfi9m5oUH5WsA00e8xEExH8QrxKxeuDyAy+Xj5yXNiIjNxFcYHKpze3wU5EUob1XkRZL1W20ObbqZIz80JBuJ8ihZGxBbBknfuaeB6hVzaNT7Sxvui6Nqk0ya3bKBzesHkIQzzeZHeVPBjcSHk0dz6JsbuGvqaKo7XB/5xG9ePntmPGsW3Ud44Gulob4IUBKfxSpGXBJc2zmFrt2W8tHSbtQMLDboJFoRiZIpndl3PtPtw272Cwoaea1hQGFBHd7rsT0oGK+9rhBl3Qb1w+ThgT+1EsHKYbGCD8hDpo1DLazijteGs/OqNpxBQl/ZaseH+n29BCR2brqf/c1a07z/XJrct4i6bQ9YXrt/s8SuD3qy9e0HOVZUmzhUp9GcB6vYcEkzdnbJjpJg6MeP8WN8S1IzlW9im73qb5YDSAJ27qvD4seHcY/1WtD23+wI5WpVqMvChYiDqN1ptk+bPTqKzI3//ormIz6x4dAYCfXzuWvsBOZPGEuSLkBvl/xQ97lQZpJzSKyYO57Nc/sTH59JdPVUImKyCIvMxVfo5Xy+Mhtlp1UhMzOOnMCHbtRZQNVSVhk5O6coVOjv06h4pyT475r2PNLkO/IC2Twz2kZ8uYDKSLz14mNc0WwHTbvvMDvdG3ShkxuwEmKrbZFjRryo2aPYsgUM3tbLnkELtH3uHb56azCH0iUSIGh9XdF+ULQyFCKRcVwi7XhTijTtuVDML0/g3PjAfitTyYl542S8zBSD+ru0UeO6LPqOmcTLk8YgWWTzzMJx4UBZJKb1Wsji7leakTHP2GmfTNEkiFmsWeRaK6i85KGsE/zgsq4OWzDGgM/uIByZbMyDjaK2nBflE11RKN8TiUUJy1UK7IvgYnGP1f2rC1Dna3iyCgeWRPguR16g2wtv0VSSSce4j60iMOpLpkfPe5nawTTsVryKraTTloiDaOQBmz0QKtwojlwuMgNmPEZyx9JZv6Da9Rk8sqwr55HJI7jYRs+HEUpDg2mVxRkgOgpq1FaykZeKZmkoF1GMWXcrFV3yha8B2Gl/rUz4UKrdVq1px9qXuxidbv1ZXDvBFonnWjHrtzhHG5rJAgqRGTR7MDeOXGrSWmio3yWFwa8PJzsgyFZvS5jds3rMbFoURSGQhkz/RdfQcezNHBekEwqMlIcTM9AJ4q8oZPjswZzSZUtF7X8vEIXEKyNf4uieoLVFin94xmgQzG7UaL+dJtebJ1bToQslsnEUmYRqXzJq/S00HeR8kRAR3DD0c/o/O55cZHIIro21ituKaBU7qJGcNGS691pEg9t+uhCX1r9SJWrehAIjRVZaaPHgF9zZaSVpmmyemRI0mg2jUJzo5zsF1dMWf2VfD7spRzQUZNeunulC4DjKCu3t+i5g3OEWSCF8l8IJbhk3j/+8fy9lvAfIoPiAGpkXdvdppZX1/XYO5WHtPuht7n/vKQCik45RQbNyfmnjUti/dhi5YihVyxZwAucf4vQDicB3v9dg1r2TtIdCTxuLxC1Fpiz1PB+KM5OBEgO+puUCRmy6mR7zQ4sFh4Jre37DU99eT7WaWziCzBnsNayZ5tJrFCM/wIXyVaZ0ZO4dNpPesy/WH9dvv5dwQk+C2EHEF7kUQj7ivV7kI3NOgL5+vx+ojsRHH/Rkz7pk9ZAbXGL2rRNCZttqm34UbXsOpf5BFdzYuJ3c3GciQ1d15OHN/ajdSjahdOmQ2CibCXIrOg+cgxuZoyhv9tr1hZ09qRdwVftWjE5hxOvDuee1F4Pajq2RGqSJg9otxTlfKwfFHrpSpNHk7p30GziHoybfLrRSGmruwYvE5O5L1ENe8jPjyINibzuAddzYToj1HaHGTX2B3x6U6rPIsgVUr7uX2m02UqvNBurfsduk5cuPnm9PpNXwV/n0mQmkLL+Tk0hUQIldmn2L2S7e60cJn2UDEci07/EhAxePNuUhumoa36UWf1C043IKyM0UfxP7THY0p1AEwWic9GPuJ/DdvPQEShP93p7I7i0t+Gaf8pF2o34ySjqp/IYBP2ZH80idtby671Yvla/ZTe2cKMpH5JsOjJk9J2IXulw+ysdnEhaVQ1hUDhWSjhJT6yCx9fZyhU2a9s9GUsMcBn/yKL/veJ5v5gxk1/v3kn46knNIlEV5C0Ur0Gb9V4AivC5kEryF3NjzA1oNnk3yTcHL0GpxdacVpMoSsVE5hjQS8iKo0uAn4ftJrPcLV+3+ipjIXEN+jfjPPRtO9StLf5HxYe/14UyfdylX6MXjNbb8reSrjsuHvL8Om+e2cfn9l9u6/5tj58KbOPTNjWTurcvxfXU4kx2N2xu8/jAoy2d5wgqISz5AbP1fkJrspOXDjr4g//+wx/8B0xFUro8KWd4AAAAASUVORK5CYII=" />
                  <span className={styles.title}>智能平台</span>
                </Link>
              </div>
              <div className={styles.desc}>&nbsp;</div>
            </div>
            <Switch>
              {getRoutes(match.path, routerData).map(item => (
                <Route
                  key={item.key}
                  path={item.path}
                  component={item.component}
                  exact={item.exact}
                />
              ))}
              <Redirect exact from="/user" to="/user/login" />
            </Switch>
          </div>
          <GlobalFooter links={links} copyright={copyright} />
        </div>
      </DocumentTitle>
    );
  }
}

export default UserLayout;
