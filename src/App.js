// App.js

import "./styles/App.css";
import Icon from './assets/food_teuchi_udon.png'

// フロントエンドとコントラクトを連携するライブラリをインポートします。
import { ethers } from "ethers";
// useEffect と useState 関数を React.js からインポートしています。
import React, { useEffect, useState ,useMemo} from "react";


import twitterLogo from "./assets/twitter-logo.svg";
import myEpicNft from "./utils/MyEpicNFT.json";

const TWITTER_HANDLE = "@KamishiroKirari";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "";
const TOTAL_MINT_COUNT = 50;

// コトントラクトアドレスをCONTRACT_ADDRESS変数に格納
const CONTRACT_ADDRESS = "0x76B8Db1DC225b1Ce0bAC22206eD6c603798221Cf";



const App = () => {
  const [lastTokenId, setLastTokenId] = useState(0);
  // ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。
  const [currentAccount, setCurrentAccount] = useState("");
  const [minting,setMinting] =useState(false);

  // ユーザーが認証可能なウォレットアドレスを持っているか確認します。
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    // ユーザーが認証可能なウォレットアドレスを持っている場合は、ユーザーに対してウォレットへのアクセス許可を求める。許可されれば、ユーザーの最初のウォレットアドレスを accounts に格納する。
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      // イベントリスナーを設定
      // この時点で、ユーザーはウォレット接続が済んでいます。
      
      setupEventListener();
      //setupMintCount();
      checkChainId();
    } else {
      console.log("No authorized account found");
    }
  };


  // connectWallet メソッドを実装します。
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      // ウォレットアドレスに対してアクセスをリクエストしています。
      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });

      console.log("Connected", accounts[0]);

      // ウォレットアドレスを currentAccount に紐付けます。
      setCurrentAccount(accounts[0]);

      // イベントリスナーを設定
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };



  // setupEventListener 関数を定義します。
  // MyEpicNFT.sol の中で event が　emit された時に、
  // 情報を受け取ります。
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        // Event が　emit される際に、コントラクトから送信される情報を受け取っています。
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          //setMintCount(tokenId.toNumber())
          alert(
            `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
        
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkChainId = async () => {
    try{
      const {ethereum} = window;
      if(ethereum){
        let chainId =await ethereum.request({method: 'eth_chainId'});
        console.log("connected to chain" +chainId);
        const rinkebyChainId = "0x4";
        if(chainId !== rinkebyChainId){
          alert("You are not connected to the Rinkeby Test Network");
        }
      }else{
        console.log("Ethereum object doesn't exist!");
      }
    }catch (error){
      console.log(error)
    }
  }

  

  // NFT を Mint する関数を定義しています。
  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        setMinting(true);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.");
        await nftTxn.wait();
        console.log(nftTxn);
        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
        setLastTokenId((prevLastTokenId) => prevLastTokenId + 1);
        setMinting(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*const handleGetLastTokenId = async (connectedContract) => {
    const id = await connectedContract.getLastTokenId();
    if (!id) return;
    setLastTokenId(id.toNumber() - 1);
  };*/

  // ページがロードされた際に下記が実行されます。
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  // renderNotConnectedContainer メソッド（ Connect to Wallet を表示する関数）を定義します。
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  // Mint NFT ボタンをレンダリングするメソッドを定義します。
  const renderMintUI = () => (
    <button
      onClick={askContractToMintNft}
      className="cta-button connect-wallet-button"
    >
      注文する
    </button>
  );

  const Disable_renderMintUI = () => (
    <button
      onClick={alert("ミント数の上限を超えました")}
      className="cta-button connect-wallet-button"
    >
      注文する
    </button>
  );

  /*
  useEffect(() => {
    const { ethereum } = window;

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      MyEpicNftABI.abi,
      signer
    );

    handleGetLastTokenId(connectedContract);
    // mint 後に emit された NewEpicNFTMinted から値を受け取る
    const handleEmitEvent = (_from, tokenId) => {
      lastTokenId(tokenId.toNumber());
    };

    connectedContract.on("NewEpicNFTMinted", handleEmitEvent);
    
  }, [currentAccount]);
  */

  

  return (
    <div className="App">
        <h1 className="header">くりぷとうどん</h1>
        <h2>ボタンを押してうどんが買えるNFTを作ろう</h2>
        
        {minting  ? (
          <>
            <img 
              style={{
                height: 300,
              }}
              src={Icon}  
              alt="アイコン"
            /><br></br>

            <p>調理中...</p>
          </>
        ):(
          <p>{lastTokenId} / 100</p>
        )}
        
        
        {currentAccount === ""
            ? renderNotConnectedContainer()
            : lastTokenId < 100 
              ? renderMintUI()
              : Disable_renderMintUI()}
    </div>
  );
};

export default App;