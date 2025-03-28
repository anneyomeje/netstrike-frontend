"use client";

import { AddressStyle } from "./AddressStyles";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Address as AddressType } from "@starknet-react/chains";
import { getChecksumAddress, validateChecksumAddress } from "starknet";
import { devnet } from "@starknet-react/chains";
import {
  CheckCircleIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-stark";
import { BlockieAvatar } from "~~/components/Scaffold-stark/BlockieAvatar/BlockieAvatar";
import { useScaffoldStarkProfile } from "~~/hooks/scaffold-stark/useScaffoldStarkProfile";
import { getStarknetPFPIfExists } from "~~/utils/profile";
import { default as NextImage } from "next/image";

type AddressProps = {
  address?: AddressType;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
};

const blockieSizeMap = {
  xs: 6,
  sm: 7,
  base: 8,
  lg: 9,
  xl: 10,
  "2xl": 12,
  "3xl": 15,
};

/**
 * Displays an address (or ENS) with a Blockie image and option to copy address.
 */
export const Address = ({
  address,
  disableAddressLink,
  format,
  size = "base",
}: AddressProps) => {
  const [ensAvatar, setEnsAvatar] = useState<string | null>();
  const [addressCopied, setAddressCopied] = useState(false);

  const { targetNetwork } = useTargetNetwork();
  const { data: fetchedProfile, isLoading } = useScaffoldStarkProfile(address);

  const checkSumAddress = useMemo(() => {
    if (!address) return undefined;

    if (address.toLowerCase() === "0x") {
      return "0x0";
    }

    return getChecksumAddress(address);
  }, [address]);

  const blockExplorerAddressLink = getBlockExplorerAddressLink(
    targetNetwork,
    checkSumAddress || address || "",
  );

  const isValidHexAddress = (value: string): boolean => {
    if (value.toLowerCase() === "0x") {
      value = "0x0";
    }

    if (value.toLowerCase() === "0x0x0") {
      return false;
    }

    const hexAddressRegex = /^0x[0-9a-fA-F]+$/;
    return hexAddressRegex.test(value);
  };

  const [displayAddress, setDisplayAddress] = useState(
    checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4),
  );

  useEffect(() => {
    const addressWithFallback = checkSumAddress || address || "";

    if (fetchedProfile?.name) {
      setDisplayAddress(fetchedProfile.name);
    } else if (format === "long") {
      setDisplayAddress(addressWithFallback || "");
    } else {
      setDisplayAddress(
        addressWithFallback.slice(0, 6) + "..." + addressWithFallback.slice(-4),
      );
    }
  }, [fetchedProfile, checkSumAddress, address, format]);

  // Skeleton UI
  if (isLoading) {
    return (
      <div className={AddressStyle.divOne}>
        <div className={AddressStyle.divTwo}></div>
        <div className={AddressStyle.divThree}>
          <div className={AddressStyle.divFour}></div>
        </div>
      </div>
    );
  }

  if (!checkSumAddress) {
    return <div className={AddressStyle.divFive}>Wallet not connected</div>;
  }

  if (!checkSumAddress) {
    return <span className="text-error">Invalid address format</span>;
  }

  return (
    <div className={AddressStyle.divSix}>
      <div className={AddressStyle.divSeven}>
        {getStarknetPFPIfExists(fetchedProfile?.profilePicture) ? (
          <NextImage
            src={fetchedProfile?.profilePicture || ""}
            alt="Profile Picture"
            className="rounded-full"
            width={24}
            height={24}
          />
        ) : (
          <BlockieAvatar
            address={checkSumAddress}
            size={(blockieSizeMap[size] * 24) / blockieSizeMap["base"]}
            ensImage={ensAvatar}
          />
        )}
      </div>
      {disableAddressLink ? (
        <span className={`ml-1.5 text-${size} font-normal`}>
          {fetchedProfile?.name || displayAddress}
        </span>
      ) : targetNetwork.network === devnet.network ? (
        <span className={`ml-1.5 text-${size} font-normal`}>
          <Link href={blockExplorerAddressLink}>
            {fetchedProfile?.name || displayAddress}
          </Link>
        </span>
      ) : (
        <a
          className={`ml-1.5 text-${size} font-normal`}
          target="_blank"
          href={blockExplorerAddressLink}
          rel="noopener noreferrer"
        >
          {fetchedProfile?.name || displayAddress}
        </a>
      )}
      {addressCopied ? (
        <CheckCircleIcon
          className={AddressStyle.circleIconStyle}
          aria-hidden="true"
        />
      ) : (
        //@ts-ignore
        <CopyToClipboard
          text={checkSumAddress}
          onCopy={() => {
            setAddressCopied(true);
            setTimeout(() => {
              setAddressCopied(false);
            }, 800);
          }}
        >
          <DocumentDuplicateIcon
            className={AddressStyle.duplicateIcon}
            aria-hidden="true"
          />
        </CopyToClipboard>
      )}
    </div>
  );
};
